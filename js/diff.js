/**
 * Word-level diff for rendering edits.
 * Returns an array of {type: 'equal'|'del'|'ins', text} segments.
 *
 * Strategy: tokenize into words + whitespace, trim the common prefix/suffix,
 * then run an LCS over the middle. For very large middles, fall back to a
 * coarser line-level diff so the browser doesn't lock up.
 */
const WordDiff = (() => {

  function tokenize(text) {
    // Keep whitespace tokens so reassembly is lossless.
    return text.match(/\S+|\s+/g) || [];
  }

  function lcsDiff(a, b) {
    const n = a.length, m = b.length;
    // DP table of LCS lengths (n+1 x m+1), flat Int32Array for speed.
    const width = m + 1;
    const table = new Int32Array((n + 1) * width);
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        table[i * width + j] = a[i - 1] === b[j - 1]
          ? table[(i - 1) * width + (j - 1)] + 1
          : Math.max(table[(i - 1) * width + j], table[i * width + (j - 1)]);
      }
    }
    // Backtrack.
    const ops = [];
    let i = n, j = m;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        ops.push({ type: 'equal', text: a[i - 1] }); i--; j--;
      } else if (table[(i - 1) * width + j] >= table[i * width + (j - 1)]) {
        ops.push({ type: 'del', text: a[i - 1] }); i--;
      } else {
        ops.push({ type: 'ins', text: b[j - 1] }); j--;
      }
    }
    while (i > 0) { ops.push({ type: 'del', text: a[i - 1] }); i--; }
    while (j > 0) { ops.push({ type: 'ins', text: b[j - 1] }); j--; }
    ops.reverse();
    return ops;
  }

  // Merge adjacent segments of the same type into single segments.
  function coalesce(ops) {
    const out = [];
    for (const op of ops) {
      const last = out[out.length - 1];
      if (last && last.type === op.type) last.text += op.text;
      else out.push({ type: op.type, text: op.text });
    }
    // Whitespace-only del/ins pairs read as noise; treat pure-whitespace
    // changes as equal text from the new version.
    return out.map(seg =>
      seg.type !== 'equal' && seg.text.trim() === ''
        ? { type: seg.type === 'ins' ? 'equal' : 'skip', text: seg.text }
        : seg
    ).filter(seg => seg.type !== 'skip');
  }

  /**
   * Merge runs of changes separated only by whitespace into one del block +
   * one ins block, so heavy rewrites read as "old phrase → new phrase"
   * instead of alternating word-by-word noise.
   */
  function clusterChanges(segs) {
    const out = [];
    let i = 0;
    while (i < segs.length) {
      if (segs[i].type === 'equal') { out.push(segs[i]); i++; continue; }
      let del = '', ins = '';
      while (i < segs.length) {
        const s = segs[i];
        if (s.type === 'del') { del += s.text; i++; }
        else if (s.type === 'ins') { ins += s.text; i++; }
        else if (s.type === 'equal' && s.text.trim() === '' && !s.text.includes('\n') &&
                 i + 1 < segs.length && segs[i + 1].type !== 'equal') {
          // Fold same-line whitespace into the cluster; never merge across
          // line breaks — adjacent edited paragraphs stay separate clusters.
          del += s.text; ins += s.text; i++;
        } else break;
      }
      if (del) out.push({ type: 'del', text: del });
      if (ins) out.push({ type: 'ins', text: ins });
    }
    return out;
  }

  const LCS_CELL_LIMIT = 4_000_000; // max DP table size for one LCS run

  /**
   * Word-level diff of two strings, or null when the changed middle is too
   * large for a single LCS table (caller falls back to line-level + refine).
   */
  function wordDiffCore(oldText, newText) {
    const a = tokenize(oldText);
    const b = tokenize(newText);

    // Trim common prefix.
    let start = 0;
    while (start < a.length && start < b.length && a[start] === b[start]) start++;
    // Trim common suffix.
    let endA = a.length, endB = b.length;
    while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }

    const midA = a.slice(start, endA);
    const midB = b.slice(start, endB);
    if (midA.length * midB.length > LCS_CELL_LIMIT) return null;

    const ops = [];
    const prefix = a.slice(0, start).join('');
    const suffix = a.slice(endA).join('');
    if (prefix) ops.push({ type: 'equal', text: prefix });
    ops.push(...lcsDiff(midA, midB));
    if (suffix) ops.push({ type: 'equal', text: suffix });
    return ops;
  }

  function splitLines(text) {
    // Keep the newline attached to each line so reassembly is lossless.
    return text.length ? text.split(/(?<=\n)/) : [];
  }

  /**
   * Two-level diff for long documents: diff lines first (cheap at any size),
   * then refine each changed del/ins line-block pair with a word-level diff.
   * A one-word edit in a paragraph highlights one word, not the paragraph.
   */
  function lineDiffRefined(oldText, newText) {
    const linesA = splitLines(oldText);
    const linesB = splitLines(newText);
    if (linesA.length * linesB.length > LCS_CELL_LIMIT) {
      // Pathological (hundreds of thousands of lines) — coarse but safe.
      return [{ type: 'del', text: oldText }, { type: 'ins', text: newText }];
    }

    const lineOps = coalesce(lcsDiff(linesA, linesB));
    const ops = [];
    let i = 0;
    while (i < lineOps.length) {
      const cur = lineOps[i];
      const next = lineOps[i + 1];
      // A replaced block appears as adjacent del/ins (either order).
      const isPair = next && cur.type !== 'equal' && next.type !== 'equal' && cur.type !== next.type;
      if (isPair) {
        const delText = cur.type === 'del' ? cur.text : next.text;
        const insText = cur.type === 'ins' ? cur.text : next.text;
        const refined = wordDiffCore(delText, insText);
        if (refined) ops.push(...refined);
        else ops.push({ type: 'del', text: delText }, { type: 'ins', text: insText });
        i += 2;
      } else {
        ops.push(cur);
        i += 1;
      }
    }
    return ops;
  }

  function diff(oldText, newText) {
    const ops = wordDiffCore(oldText, newText) || lineDiffRefined(oldText, newText);
    return clusterChanges(coalesce(ops));
  }

  return { diff };
})();
