/**
 * Claude API layer — called directly from the browser with the user's own key.
 * Uses structured outputs (output_config.format) so responses are guaranteed
 * valid JSON matching our schemas.
 */
const ClaudeAPI = (() => {
  const API_URL = 'https://api.anthropic.com/v1/messages';
  const MODEL = 'claude-opus-4-8';

  function headers(apiKey) {
    return {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required for calling the API from a browser. Safe here because the
      // key is the user's own, entered by them, stored only locally.
      'anthropic-dangerous-direct-browser-access': 'true',
    };
  }

  async function throwApiError(res) {
    let message = `API error (HTTP ${res.status})`;
    try {
      const body = await res.json();
      if (body.error && body.error.message) message = body.error.message;
    } catch (_) { /* non-JSON error body */ }
    if (res.status === 401) message += '\nCheck your API key in Settings.';
    if (res.status === 429) message += '\nRate limited — wait a moment and try again.';
    throw new Error(message);
  }

  const CLASSIFY_SCHEMA = {
    type: 'object',
    properties: {
      document_type: { type: 'string', description: 'One of the provided type ids, or "other" if none fit' },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      audience: { type: 'string', description: 'Who this piece is written for, in a short phrase' },
      notes: { type: 'string', description: 'One sentence on what signals drove the classification' },
    },
    required: ['document_type', 'confidence', 'audience', 'notes'],
    additionalProperties: false,
  };

  /** Classify the writing type. Small, fast, non-streaming call. */
  async function classify(text, types, apiKey) {
    const typeList = types.map(t => `- ${t.id}: ${t.description}`).join('\n');
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: headers(apiKey),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        system: `You classify marketing copy by document type so it can be routed to the right editing skills.\n\nAvailable types:\n${typeList}\n\nIf the piece genuinely fits none of these, use "other". Classify based on structure, intent, and conventions — not just topic.`,
        messages: [{ role: 'user', content: `Classify this piece of writing:\n\n<draft>\n${text}\n</draft>` }],
        output_config: { format: { type: 'json_schema', schema: CLASSIFY_SCHEMA } },
      }),
    });
    if (!res.ok) await throwApiError(res);
    const data = await res.json();
    if (data.stop_reason === 'refusal') throw new Error('The model declined this request.');
    const textBlock = data.content.find(b => b.type === 'text');
    return JSON.parse(textBlock.text);
  }

  const EDIT_SCHEMA = {
    type: 'object',
    properties: {
      edited_text: { type: 'string', description: 'The complete edited piece, in full. Preserve the original formatting conventions (markdown, line breaks, etc.).' },
      summary: { type: 'string', description: 'Two or three sentences summarizing the overall editorial direction of the changes.' },
      changes: {
        type: 'array',
        description: 'Every meaningful change made, in document order.',
        items: {
          type: 'object',
          properties: {
            original_excerpt: { type: 'string', description: 'Short verbatim excerpt of the original text that was changed' },
            revised_excerpt: { type: 'string', description: 'Short verbatim excerpt of the replacement text (empty string if deleted)' },
            rationale: { type: 'string', description: 'Why this change improves the writing, in one or two sentences' },
            skill: { type: 'string', description: 'The id of the editing skill that motivated this change' },
          },
          required: ['original_excerpt', 'revised_excerpt', 'rationale', 'skill'],
          additionalProperties: false,
        },
      },
    },
    required: ['edited_text', 'summary', 'changes'],
    additionalProperties: false,
  };

  function buildEditSystemPrompt(typeLabel, skills) {
    const skillBlocks = skills.map(s =>
      `<skill id="${s.id}" name="${s.label}">\n${s.content}\n</skill>`
    ).join('\n\n');

    return `You are a senior marketing copy editor. You are editing a piece classified as: ${typeLabel}.

Apply the editing skills below. Each skill is a set of editorial rules; when you make a change, attribute it to the skill that motivated it (use the skill's id).

${skillBlocks}

Editing principles:
- Preserve the author's meaning, claims, facts, and voice. You are editing, not rewriting.
- Preserve the original formatting conventions exactly (markdown syntax, headings, line breaks, list structure).
- Make every change for a reason you can articulate. If a sentence is already good, leave it alone.
- Record every meaningful change in the changes array with a short verbatim excerpt of the original, the revision, and the rationale. Group word-level tweaks within one sentence into a single change entry.
- The edited_text field must contain the COMPLETE edited piece from first word to last — never truncate or summarize it.`;
  }

  /**
   * Run the editing pass with streaming (long outputs), returning parsed JSON.
   * onProgress receives the running count of characters received.
   */
  async function edit(text, typeLabel, skills, apiKey, onProgress) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: headers(apiKey),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 64000,
        stream: true,
        thinking: { type: 'adaptive' },
        system: buildEditSystemPrompt(typeLabel, skills),
        messages: [{ role: 'user', content: `Edit this draft:\n\n<draft>\n${text}\n</draft>` }],
        output_config: { format: { type: 'json_schema', schema: EDIT_SCHEMA } },
      }),
    });
    if (!res.ok) await throwApiError(res);

    // Parse the SSE stream, accumulating text deltas.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let output = '';
    let stopReason = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        for (const line of rawEvent.split('\n')) {
          if (!line.startsWith('data:')) continue;
          let event;
          try { event = JSON.parse(line.slice(5).trim()); } catch (_) { continue; }
          if (event.type === 'content_block_delta' && event.delta && event.delta.type === 'text_delta') {
            output += event.delta.text;
            if (onProgress) onProgress(output.length);
          } else if (event.type === 'message_delta' && event.delta && event.delta.stop_reason) {
            stopReason = event.delta.stop_reason;
          } else if (event.type === 'error') {
            throw new Error(event.error && event.error.message ? event.error.message : 'Stream error');
          }
        }
      }
    }

    if (stopReason === 'refusal') throw new Error('The model declined this request.');
    if (stopReason === 'max_tokens') throw new Error('The draft is too long for a single pass — try a shorter piece or split it into sections.');
    return JSON.parse(output);
  }

  return { classify, edit };
})();
