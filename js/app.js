/** Main app: wires the UI to the classify → route skills → edit pipeline. */
(() => {
  const $ = id => document.getElementById(id);

  const els = {
    settingsBtn: $('settings-btn'),
    settingsDialog: $('settings-dialog'),
    apiKeyInput: $('api-key-input'),
    saveSettings: $('save-settings'),
    typeSelect: $('type-select'),
    draftInput: $('draft-input'),
    wordCount: $('word-count'),
    runBtn: $('run-btn'),
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
    viewDiff: $('view-diff'),
    viewClean: $('view-clean'),
    copyBtn: $('copy-btn'),
  };

  const KEY_STORAGE = 'copydesk-api-key';
  let lastEditedText = '';

  // ---------- settings ----------
  function getApiKey() { return localStorage.getItem(KEY_STORAGE) || ''; }

  els.settingsBtn.addEventListener('click', () => {
    els.apiKeyInput.value = getApiKey();
    els.settingsDialog.showModal();
  });

  els.settingsDialog.addEventListener('close', () => {
    if (els.settingsDialog.returnValue === 'save') {
      localStorage.setItem(KEY_STORAGE, els.apiKeyInput.value.trim());
    }
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
    els.resultsSection.classList.add('hidden');

    const text = els.draftInput.value.trim();
    if (!text) { showError('Paste a draft first.'); return; }

    const apiKey = getApiKey();
    if (!apiKey) {
      showError('No API key set. Open Settings (top right) and add your Anthropic API key.');
      return;
    }

    els.runBtn.disabled = true;
    try {
      const types = await Skills.getTypes();

      // 1. Classify (or use the manual override).
      let typeId, typeLabel, classification = null;
      if (els.typeSelect.value !== 'auto') {
        typeId = els.typeSelect.value;
        typeLabel = types.find(t => t.id === typeId).label;
      } else {
        setStatus('Identifying the kind of writing…');
        classification = await ClaudeAPI.classify(text, types, apiKey);
        typeId = classification.document_type;
        const match = types.find(t => t.id === typeId);
        typeLabel = match ? match.label : 'General marketing copy';
        if (!match) typeId = 'other';
      }

      // 2. Route to applicable skills.
      const skills = await Skills.skillsForType(typeId);

      // 3. Edit.
      setStatus(`Editing as ${typeLabel.toLowerCase()} with ${skills.length} skill${skills.length === 1 ? '' : 's'}…`);
      const result = await ClaudeAPI.edit(text, typeLabel, skills, apiKey, chars => {
        setStatus(`Editing as ${typeLabel.toLowerCase()}… (${Math.round(chars / 1000)}k characters received)`);
      });

      // 4. Render.
      clearStatus();
      render(text, result, { typeLabel, classification, skills });
    } catch (err) {
      clearStatus();
      showError(err.message);
    } finally {
      els.runBtn.disabled = false;
    }
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
    els.classificationBadge.textContent = badgeText;
    els.skillsUsed.textContent = 'Skills applied: ' + meta.skills.map(s => s.label).join(', ');

    // Summary.
    els.editSummary.textContent = result.summary;

    // Diff view.
    const segments = WordDiff.diff(originalText, result.edited_text);
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

    // Clean view.
    els.cleanOutput.textContent = result.edited_text;

    // Changes panel.
    els.changesList.textContent = '';
    els.changeCount.textContent = `${result.changes.length} change${result.changes.length === 1 ? '' : 's'}`;
    for (const change of result.changes) {
      els.changesList.appendChild(renderChangeCard(change, meta.skills));
    }

    els.resultsSection.classList.remove('hidden');
    els.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderChangeCard(change, skills) {
    const card = document.createElement('div');
    card.className = 'change-card';

    const skill = skills.find(s => s.id === change.skill);
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.textContent = skill ? skill.label : change.skill;
    card.appendChild(tag);

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

    card.addEventListener('click', () => highlightChangeInDiff(change));
    return card;
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
          el.classList.add('flash');
          setTimeout(() => el.classList.remove('flash'), 1600);
          return;
        }
      }
    }
  }

  // ---------- view toggles ----------
  function showDiffView() {
    els.diffOutput.classList.remove('hidden');
    els.cleanOutput.classList.add('hidden');
    els.viewDiff.classList.add('active');
    els.viewClean.classList.remove('active');
  }
  function showCleanView() {
    els.diffOutput.classList.add('hidden');
    els.cleanOutput.classList.remove('hidden');
    els.viewDiff.classList.remove('active');
    els.viewClean.classList.add('active');
  }
  els.viewDiff.addEventListener('click', showDiffView);
  els.viewClean.addEventListener('click', showCleanView);

  els.copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(lastEditedText);
    els.copyBtn.textContent = 'Copied ✓';
    setTimeout(() => { els.copyBtn.textContent = 'Copy edited text'; }, 1500);
  });
})();
