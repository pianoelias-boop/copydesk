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

  function diff(oldText, newText) {
    let a = tokenize(oldText);
    let b = tokenize(newText);

    // Trim common prefix.
    let start = 0;
    while (start < a.length && start < b.length && a[start] === b[start]) start++;
    // Trim common suffix.
    let endA = a.length, endB = b.length;
    while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }

    const prefix = a.slice(0, start).join('');
    const suffix = a.slice(endA).join('');
    const midA = a.slice(start, endA);
    const midB = b.slice(start, endB);

    let middleOps;
    if (midA.length * midB.length > 4_000_000) {
      // Too large for word-level LCS — diff at line granularity instead.
      const linesA = midA.join('').split('\n');
      const linesB = midB.join('').split('\n');
      middleOps = lcsDiff(linesA, linesB).map(op => ({ ...op, text: op.text + '\n' }));
      // Drop the trailing newline added to the final segment.
      if (middleOps.length) {
        const last = middleOps[middleOps.length - 1];
        last.text = last.text.replace(/\n$/, '');
      }
    } else {
      middleOps = lcsDiff(midA, midB);
    }

    const ops = [];
    if (prefix) ops.push({ type: 'equal', text: prefix });
    ops.push(...middleOps);
    if (suffix) ops.push({ type: 'equal', text: suffix });
    return coalesce(ops);
  }

  return { diff };
})();
