/** Main app: wires the UI to the classify → route skills → edit pipeline. */
(() => {
  const $ = id => document.getElementById(id);

  const els = {
    settingsBtn: $('settings-btn'),
    settingsDialog: $('settings-dialog'),
    apiKeyInput: $('api-key-input'),
    typeSelect: $('type-select'),
    deepEdit: $('deep-edit'),
    draftInput: $('draft-input'),
    wordCount: $('word-count'),
    runBtn: $('run-btn'),
    emptyState: $('empty-state'),
    statusSection: $('status-section'),
    statusText: $('status-text'),
    errorSection: $('error-section'),
    errorText: $('error-text'),
    resultsSection: $('results-section'),
    classificationBadge: $('classification-badge'),
    skillsUsed: $('skills-used'),
    editSummary: $('edit-summary'),
    diffOutput: $('diff-output'),
    cleanOutput: $('clean-output'),
    changesList: $('changes-list'),
    changeCount: $('change-count'),
    viewScreenshot: $('view-screenshot'),
    viewCompare: $('view-compare'),
    viewDiff: $('view-diff'),
    viewClean: $('view-clean'),
    compareOutput: $('compare-output'),
    origPane: $('orig-pane'),
    editPane: $('edit-pane'),
    copyBtn: $('copy-btn'),
    imagePreview: $('image-preview'),
    imageThumb: $('image-thumb'),
    imageInfo: $('image-info'),
    removeImage: $('remove-image'),
    browseBtn: $('browse-btn'),
    fileInput: $('file-input'),
    screenshotOutput: $('screenshot-output'),
    screenshotImg: $('screenshot-img'),
    annotationLayer: $('annotation-layer'),
  };

  const KEY_STORAGE = 'copydesk-api-key';
  const BACKEND_STORAGE = 'copydesk-backend'; // 'api' | 'local'
  // Opus high-res vision maximum — coordinates map 1:1 to pixels at or below
  // this size, so we downscale client-side and annotate the same image we send.
  const MAX_IMAGE_EDGE = 2576;

  let lastEditedText = '';
  let currentImage = null; // {base64, mediaType, dataUrl, width, height}

  // ---------- settings ----------
  function getApiKey() { return localStorage.getItem(KEY_STORAGE) || ''; }
  function getBackend() { return localStorage.getItem(BACKEND_STORAGE) || 'api'; }

  els.settingsBtn.addEventListener('click', () => {
    els.apiKeyInput.value = getApiKey();
    const backend = getBackend();
    document.getElementById('backend-api').checked = backend === 'api';
    document.getElementById('backend-local').checked = backend === 'local';
    els.settingsDialog.showModal();
  });

  els.settingsDialog.addEventListener('close', () => {
    if (els.settingsDialog.returnValue === 'save') {
      localStorage.setItem(KEY_STORAGE, els.apiKeyInput.value.trim());
      const backend = document.getElementById('backend-local').checked ? 'local' : 'api';
      localStorage.setItem(BACKEND_STORAGE, backend);
    }
  });

  // ---------- image input ----------

  /** Downscale to MAX_IMAGE_EDGE and re-encode as JPEG (keeps base64 small). */
  async function prepareImage(fileOrBlob) {
    const bitmap = await createImageBitmap(fileOrBlob);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // flatten transparency
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    return {
      dataUrl,
      base64: dataUrl.split(',')[1],
      mediaType: 'image/jpeg',
      width,
      height,
    };
  }

  async function setImage(fileOrBlob) {
    try {
      currentImage = await prepareImage(fileOrBlob);
    } catch (err) {
      showError('Could not read that image: ' + err.message);
      return;
    }
    els.imageThumb.src = currentImage.dataUrl;
    els.imageInfo.textContent = `Screenshot · ${currentImage.width}×${currentImage.height}px — the pipeline will transcribe, edit, and annotate it. Use the text box below for optional notes.`;
    els.imagePreview.classList.remove('hidden');
    els.draftInput.placeholder = 'Optional notes for the editor — audience, goal, constraints…';
  }

  function clearImage() {
    currentImage = null;
    els.imagePreview.classList.add('hidden');
    els.imageThumb.src = '';
    els.draftInput.placeholder = 'Paste your draft here — a landing page, email, blog post, social post, ad copy, or press release…';
  }

  els.removeImage.addEventListener('click', clearImage);
  els.browseBtn.addEventListener('click', () => els.fileInput.click());
  els.fileInput.addEventListener('change', () => {
    if (els.fileInput.files[0]) setImage(els.fileInput.files[0]);
    els.fileInput.value = '';
  });

  // Paste a screenshot anywhere on the page.
  document.addEventListener('paste', e => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        setImage(item.getAsFile());
        return;
      }
    }
  });

  // Drag and drop anywhere on the page.
  let dragDepth = 0;
  document.addEventListener('dragenter', e => {
    if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) {
      dragDepth++;
      document.body.classList.add('drop-active');
    }
  });
  document.addEventListener('dragleave', () => {
    if (--dragDepth <= 0) { dragDepth = 0; document.body.classList.remove('drop-active'); }
  });
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', e => {
    e.preventDefault();
    dragDepth = 0;
    document.body.classList.remove('drop-active');
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) setImage(file);
  });

  // ---------- input helpers ----------
  els.draftInput.addEventListener('input', () => {
    const words = (els.draftInput.value.match(/\S+/g) || []).length;
    els.wordCount.textContent = words ? `${words} words` : '';
  });

  // Populate the type dropdown from the manifest.
  Skills.getTypes().then(types => {
    for (const t of types) {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.label;
      els.typeSelect.appendChild(opt);
    }
  }).catch(err => showError(err.message));

  // ---------- status / error ----------
  function setStatus(text) {
    els.statusSection.classList.remove('hidden');
    els.statusText.textContent = text;
  }
  function clearStatus() { els.statusSection.classList.add('hidden'); }
  function showError(message) {
    els.errorSection.classList.remove('hidden');
    els.errorText.textContent = message;
  }
  function clearError() { els.errorSection.classList.add('hidden'); }

  // ---------- pipeline ----------
  els.runBtn.addEventListener('click', runPipeline);

  async function runPipeline() {
    clearError();
    els.emptyState.classList.add('hidden');
    els.resultsSection.classList.add('hidden');

    const text = els.draftInput.value.trim();
    if (!text && !currentImage) { showError('Paste a draft or a screenshot first.'); return; }

    const apiKey = getApiKey();
    if (getBackend() === 'api' && !apiKey) {
      showError('No API key set. Open Settings (top right) and add your Anthropic API key — or switch the backend to Local Claude Code.');
      return;
    }

    els.runBtn.disabled = true;
    try {
      const types = await Skills.getTypes();
      const isImage = !!currentImage;
      const image = currentImage; // snapshot, in case the user clears it mid-run

      // 1. Classify (and transcribe, for screenshots) — or use the manual override.
      //    With a manual type + screenshot we still need the transcription, so
      //    the classify call runs whenever there's an image.
      let typeId, typeLabel, classification = null, workingText = text;
      const manualType = els.typeSelect.value !== 'auto';

      if (isImage) {
        setStatus('Reading the screenshot…');
        classification = await ClaudeAPI.classify({ text, image }, types, apiKey);
        workingText = classification.transcription;
        if (!workingText || !workingText.trim()) throw new Error('No copy could be read from the screenshot.');
      } else if (!manualType) {
        setStatus('Identifying the kind of writing…');
        classification = await ClaudeAPI.classify({ text }, types, apiKey);
      }

      if (manualType) {
        typeId = els.typeSelect.value;
        typeLabel = types.find(t => t.id === typeId).label;
      } else {
        typeId = classification.document_type;
        const match = types.find(t => t.id === typeId);
        typeLabel = match ? match.label : 'General marketing copy';
        if (!match) typeId = 'other';
      }

      // 2. Route to applicable skills.
      const skills = await Skills.skillsForType(typeId);

      // 3. Edit — one combined pass, or the three-pass deep edit.
      let result;
      if (!els.deepEdit.checked) {
        setStatus(`Editing as ${typeLabel.toLowerCase()} with ${skills.length} skill${skills.length === 1 ? '' : 's'}…`);
        const editInput = isImage
          ? { text: workingText, image, notes: text || null }
          : { text: workingText };
        result = await ClaudeAPI.edit(editInput, typeLabel, skills, apiKey, chars => {
          setStatus(`Editing as ${typeLabel.toLowerCase()}… (${Math.round(chars / 1000)}k characters received)`);
        });
      } else {
        result = await runDeepEdit(workingText, typeLabel, skills, apiKey,
          isImage ? { image, notes: text || null } : null);
      }

      // 4. Render.
      clearStatus();
      render(workingText, result, { typeLabel, classification: manualType ? null : classification, skills, image });
    } catch (err) {
      clearStatus();
      showError(err.message);
    } finally {
      els.runBtn.disabled = false;
    }
  }

  /**
   * Deep edit: three focused passes, mirroring the Article Generator's
   * editing pipeline. Craft skills first (everything untagged), then the
   * AI-voice regen, then the human-writing regen. Each regen pass carries a
   * retention-inventory instruction so facts/quotes/stats survive.
   * Changes from all passes aggregate into one list, tagged by pass.
   */
  async function runDeepEdit(workingText, typeLabel, skills, apiKey, imageCtx) {
    const passes = [
      { label: 'Craft edit', skills: skills.filter(s => !s.deepEditPass), regen: false },
      { label: 'AI-voice pass', skills: skills.filter(s => s.deepEditPass === 'ai-voice'), regen: true },
      { label: 'Human-writing pass', skills: skills.filter(s => s.deepEditPass === 'human-writing'), regen: true },
    ].filter(p => p.skills.length > 0);

    let textState = workingText;
    const allChanges = [];
    const summaries = [];

    for (let i = 0; i < passes.length; i++) {
      const p = passes[i];
      const stage = `Pass ${i + 1} of ${passes.length} — ${p.label.toLowerCase()}`;
      setStatus(`${stage}…`);
      // The screenshot rides along only on the first pass (that's where
      // change regions get located); regen passes work on text alone.
      const input = (i === 0 && imageCtx)
        ? { text: textState, image: imageCtx.image, notes: imageCtx.notes }
        : { text: textState };
      const r = await ClaudeAPI.edit(input, typeLabel, p.skills, apiKey, chars => {
        setStatus(`${stage}… (${Math.round(chars / 1000)}k characters received)`);
      }, p.regen ? { label: p.label, regen: true } : undefined);

      textState = r.edited_text;
      for (const c of r.changes) allChanges.push({ ...c, pass: p.label });
      summaries.push(`${p.label}: ${r.summary}`);
    }

    return { edited_text: textState, summary: summaries.join('\n'), changes: allChanges };
  }

  // ---------- rendering ----------
  function render(originalText, result, meta) {
    lastEditedText = result.edited_text;

    // Classification badge.
    let badgeText = meta.typeLabel;
    if (meta.classification) {
      badgeText += ` · ${meta.classification.confidence} confidence`;
      els.classificationBadge.title = `${meta.classification.notes}\nAudience: ${meta.classification.audience}`;
    } else {
      badgeText += ' · manually selected';
      els.classificationBadge.title = '';
    }
    if (meta.image) badgeText += ' · from screenshot';
    els.classificationBadge.textContent = badgeText;
    els.skillsUsed.textContent = 'Skills applied: ' + meta.skills.map(s => s.label).join(', ');

    // Summary.
    els.editSummary.textContent = result.summary;

    // Build all text views from one diff.
    const segments = WordDiff.diff(originalText, result.edited_text);

    // Inline view: full stream of equal/del/ins.
    els.diffOutput.textContent = '';
    for (const seg of segments) {
      if (seg.type === 'equal') {
        els.diffOutput.appendChild(document.createTextNode(seg.text));
      } else {
        const el = document.createElement(seg.type === 'ins' ? 'ins' : 'del');
        el.textContent = seg.text;
        els.diffOutput.appendChild(el);
      }
    }

    // Side-by-side view: original pane gets equal+del, edited pane equal+ins.
    els.origPane.textContent = '';
    els.editPane.textContent = '';
    for (const seg of segments) {
      if (seg.type === 'equal') {
        els.origPane.appendChild(document.createTextNode(seg.text));
        els.editPane.appendChild(document.createTextNode(seg.text));
      } else if (seg.type === 'del') {
        const el = document.createElement('del');
        el.textContent = seg.text;
        els.origPane.appendChild(el);
      } else {
        const el = document.createElement('ins');
        el.textContent = seg.text;
        els.editPane.appendChild(el);
      }
    }

    // Make highlights navigable: tooltip with the rationale, click → card.
    for (const container of [els.diffOutput, els.origPane, els.editPane]) {
      linkSpansToChanges(container, result.changes);
    }

    // Clean view.
    els.cleanOutput.textContent = result.edited_text;

    // Annotated screenshot view.
    if (meta.image) {
      renderAnnotations(meta.image, result.changes);
      els.viewScreenshot.classList.remove('hidden');
      showScreenshotView();
    } else {
      els.viewScreenshot.classList.add('hidden');
      showCompareView();
    }

    // Changes panel.
    els.changesList.textContent = '';
    els.changeCount.textContent = `${result.changes.length} change${result.changes.length === 1 ? '' : 's'}`;
    result.changes.forEach((change, i) => {
      els.changesList.appendChild(renderChangeCard(change, i, meta.skills, !!meta.image));
    });

    els.resultsSection.classList.remove('hidden');
    els.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderAnnotations(image, changes) {
    els.screenshotImg.src = image.dataUrl;
    els.annotationLayer.textContent = '';
    changes.forEach((change, i) => {
      const r = change.region;
      if (!r || !r.width || !r.height) return;
      const box = document.createElement('div');
      box.className = 'anno-box';
      box.dataset.index = i;
      // Percentage positioning so boxes track the responsively-sized image.
      box.style.left = (r.x / image.width * 100) + '%';
      box.style.top = (r.y / image.height * 100) + '%';
      box.style.width = (r.width / image.width * 100) + '%';
      box.style.height = (r.height / image.height * 100) + '%';
      box.title = change.rationale;

      const num = document.createElement('span');
      num.className = 'anno-num';
      num.textContent = i + 1;
      box.appendChild(num);

      box.addEventListener('click', () => {
        const card = els.changesList.children[i];
        if (!card) return;
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        flash(card);
      });
      els.annotationLayer.appendChild(box);
    });
  }

  function renderChangeCard(change, index, skills, hasImage) {
    const card = document.createElement('div');
    card.className = 'change-card';

    const num = document.createElement('span');
    num.className = 'change-num';
    num.textContent = index + 1;
    card.appendChild(num);

    const skill = skills.find(s => s.id === change.skill);
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.textContent = skill ? skill.label : change.skill;
    card.appendChild(tag);

    if (change.pass) {
      const passTag = document.createElement('span');
      passTag.className = 'pass-tag';
      passTag.textContent = change.pass;
      card.appendChild(passTag);
    }

    if (change.original_excerpt) {
      const before = document.createElement('div');
      before.className = 'before';
      before.textContent = change.original_excerpt;
      card.appendChild(before);
    }
    if (change.revised_excerpt) {
      const after = document.createElement('div');
      after.className = 'after';
      after.textContent = change.revised_excerpt;
      card.appendChild(after);
    }

    const reason = document.createElement('div');
    reason.className = 'reason';
    reason.textContent = change.rationale;
    card.appendChild(reason);

    card.addEventListener('click', () => {
      // Flash in whichever view is showing; prefer the screenshot region when
      // it's visible and this change has one.
      const screenshotVisible = !els.screenshotOutput.classList.contains('hidden');
      if (screenshotVisible && hasImage) {
        const box = els.annotationLayer.querySelector(`.anno-box[data-index="${index}"]`);
        if (box) {
          box.scrollIntoView({ behavior: 'smooth', block: 'center' });
          flash(box);
          return;
        }
      }
      const compareVisible = !els.compareOutput.classList.contains('hidden');
      if (compareVisible && highlightChangeInCompare(index)) return;
      highlightChangeInDiff(change);
    });
    return card;
  }

  /** In the side-by-side view, flash this change's highlight in both panes. */
  function highlightChangeInCompare(index) {
    let found = false;
    for (const pane of [els.editPane, els.origPane]) {
      const el = pane.querySelector(`[data-change="${index}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        flash(el);
        found = true;
      }
    }
    return found;
  }

  function flash(el) {
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 1600);
  }

  const normText = s => s.replace(/\s+/g, ' ').trim().toLowerCase();

  /**
   * Attach each ins/del highlight to the change card that explains it:
   * tooltip shows the rationale, click scrolls to and flashes the card.
   * Matching is fuzzy (excerpt and segment text overlap either way) — spans
   * the model didn't itemize stay plain highlights.
   */
  function linkSpansToChanges(container, changes) {
    for (const el of container.querySelectorAll('ins, del')) {
      const segText = normText(el.textContent);
      if (!segText) continue;
      const idx = changes.findIndex(c => {
        const excerpt = normText(el.tagName === 'INS' ? c.revised_excerpt : c.original_excerpt);
        return excerpt && (excerpt.includes(segText) || segText.includes(excerpt));
      });
      if (idx === -1) continue;
      el.dataset.change = idx;
      el.title = changes[idx].rationale;
      el.addEventListener('click', () => {
        const card = els.changesList.children[idx];
        if (!card) return;
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        flash(card);
      });
    }
  }

  // Proportional scroll-sync between the compare panes.
  let syncingPane = false;
  function syncPane(from, to) {
    if (syncingPane) return;
    syncingPane = true;
    const fromMax = from.scrollHeight - from.clientHeight;
    const toMax = to.scrollHeight - to.clientHeight;
    if (fromMax > 0 && toMax > 0) {
      to.scrollTop = (from.scrollTop / fromMax) * toMax;
    }
    requestAnimationFrame(() => { syncingPane = false; });
  }

  /** Scroll the diff to the segment that best matches this change and flash it. */
  function highlightChangeInDiff(change) {
    showDiffView();
    const norm = s => s.replace(/\s+/g, ' ').trim().toLowerCase();
    const targets = [
      { sel: 'ins', text: norm(change.revised_excerpt) },
      { sel: 'del', text: norm(change.original_excerpt) },
    ];
    for (const { sel, text } of targets) {
      if (!text) continue;
      for (const el of els.diffOutput.querySelectorAll(sel)) {
        const segText = norm(el.textContent);
        if (text.includes(segText) || segText.includes(text)) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          flash(el);
          return;
        }
      }
    }
  }

  // ---------- view toggles ----------
  function setView(view) {
    els.screenshotOutput.classList.toggle('hidden', view !== 'screenshot');
    els.compareOutput.classList.toggle('hidden', view !== 'compare');
    els.diffOutput.classList.toggle('hidden', view !== 'diff');
    els.cleanOutput.classList.toggle('hidden', view !== 'clean');
    els.viewScreenshot.classList.toggle('active', view === 'screenshot');
    els.viewCompare.classList.toggle('active', view === 'compare');
    els.viewDiff.classList.toggle('active', view === 'diff');
    els.viewClean.classList.toggle('active', view === 'clean');
  }
  const showCompareView = () => setView('compare');
  const showDiffView = () => setView('diff');
  const showCleanView = () => setView('clean');
  const showScreenshotView = () => setView('screenshot');

  els.viewScreenshot.addEventListener('click', showScreenshotView);
  els.viewCompare.addEventListener('click', showCompareView);
  els.viewDiff.addEventListener('click', showDiffView);
  els.viewClean.addEventListener('click', showCleanView);

  els.origPane.addEventListener('scroll', () => syncPane(els.origPane, els.editPane));
  els.editPane.addEventListener('scroll', () => syncPane(els.editPane, els.origPane));

  els.copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(lastEditedText);
    els.copyBtn.textContent = 'Copied ✓';
    setTimeout(() => { els.copyBtn.textContent = 'Copy edited text'; }, 1500);
  });
})();
