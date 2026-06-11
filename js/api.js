/**
 * Claude API layer — called directly from the browser with the user's own key.
 * Uses structured outputs (output_config.format) so responses are guaranteed
 * valid JSON matching our schemas.
 *
 * Inputs can be text, a screenshot, or both. For screenshots the classify
 * call also transcribes the copy, and the edit call returns a pixel bounding
 * box for each change so it can be drawn on the image.
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
    if (res.status === 413) message += '\nThe screenshot is too large — try cropping it.';
    if (res.status === 429) message += '\nRate limited — wait a moment and try again.';
    throw new Error(message);
  }

  function imageBlock(image) {
    return {
      type: 'image',
      source: { type: 'base64', media_type: image.mediaType, data: image.base64 },
    };
  }

  // ---------- classification (and transcription, for screenshots) ----------

  function classifySchema(withTranscription) {
    const properties = {
      document_type: { type: 'string', description: 'One of the provided type ids, or "other" if none fit' },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      audience: { type: 'string', description: 'Who this piece is written for, in a short phrase' },
      notes: { type: 'string', description: 'One sentence on what signals drove the classification' },
    };
    if (withTranscription) {
      properties.transcription = {
        type: 'string',
        description: 'Complete, faithful transcription of all the copy visible in the screenshot, in reading order, with line breaks preserving the visual structure. Do not correct, paraphrase, or omit anything.',
      };
    }
    return {
      type: 'object',
      properties,
      required: Object.keys(properties),
      additionalProperties: false,
    };
  }

  /**
   * Classify the writing type. For screenshots, also transcribe the copy.
   * input: { text?: string, image?: {base64, mediaType} }
   */
  async function classify(input, types, apiKey) {
    const typeList = types.map(t => `- ${t.id}: ${t.description}`).join('\n');
    const isImage = !!input.image;

    let system = `You classify marketing copy by document type so it can be routed to the right editing skills.\n\nAvailable types:\n${typeList}\n\nIf the piece genuinely fits none of these, use "other". Classify based on structure, intent, and conventions — not just topic.`;
    if (isImage) {
      system += `\n\nThe draft is provided as a screenshot. Also transcribe every piece of copy in it, faithfully and completely — the transcription becomes the working text for editing, so accuracy matters more than tidiness.`;
    }

    const content = [];
    if (isImage) {
      content.push(imageBlock(input.image));
      let prompt = 'Classify the writing in this screenshot and transcribe its copy.';
      if (input.text) prompt += `\n\nNotes from the author:\n${input.text}`;
      content.push({ type: 'text', text: prompt });
    } else {
      content.push({ type: 'text', text: `Classify this piece of writing:\n\n<draft>\n${input.text}\n</draft>` });
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: headers(apiKey),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: isImage ? 8000 : 2000,
        system,
        messages: [{ role: 'user', content }],
        output_config: { format: { type: 'json_schema', schema: classifySchema(isImage) } },
      }),
    });
    if (!res.ok) await throwApiError(res);
    const data = await res.json();
    if (data.stop_reason === 'refusal') throw new Error('The model declined this request.');
    const textBlock = data.content.find(b => b.type === 'text');
    return JSON.parse(textBlock.text);
  }

  // ---------- editing ----------

  function editSchema(withRegions) {
    const changeProperties = {
      original_excerpt: { type: 'string', description: 'Short verbatim excerpt of the original text that was changed' },
      revised_excerpt: { type: 'string', description: 'Short verbatim excerpt of the replacement text (empty string if deleted)' },
      rationale: { type: 'string', description: 'Why this change improves the writing, in one or two sentences' },
      skill: { type: 'string', description: 'The id of the editing skill that motivated this change' },
    };
    if (withRegions) {
      changeProperties.region = {
        description: 'Pixel bounding box of where the ORIGINAL text sits in the screenshot, origin at the top-left corner. null if the location cannot be determined.',
        anyOf: [
          {
            type: 'object',
            properties: {
              x: { type: 'integer' },
              y: { type: 'integer' },
              width: { type: 'integer' },
              height: { type: 'integer' },
            },
            required: ['x', 'y', 'width', 'height'],
            additionalProperties: false,
          },
          { type: 'null' },
        ],
      };
    }
    return {
      type: 'object',
      properties: {
        edited_text: { type: 'string', description: 'The complete edited piece, in full. Preserve the original formatting conventions (markdown, line breaks, etc.).' },
        summary: { type: 'string', description: 'Two or three sentences summarizing the overall editorial direction of the changes.' },
        changes: {
          type: 'array',
          description: 'Every meaningful change made, in document order.',
          items: {
            type: 'object',
            properties: changeProperties,
            required: Object.keys(changeProperties),
            additionalProperties: false,
          },
        },
      },
      required: ['edited_text', 'summary', 'changes'],
      additionalProperties: false,
    };
  }

  function skillBlocksFor(skills) {
    return skills.map(s =>
      `<skill id="${s.id}" name="${s.label}">\n${s.content}\n</skill>`
    ).join('\n\n');
  }

  /**
   * System prompt for a deep-edit regeneration pass (AI-voice / human-writing).
   * Mirrors the Article Generator's full-regen-with-retention methodology:
   * build a retention inventory, rewrite against one editorial concern,
   * lose nothing.
   */
  function buildRegenPassSystemPrompt(typeLabel, skills, passLabel) {
    return `You are running the "${passLabel}" editing pass on a piece of marketing copy classified as: ${typeLabel}. This is one pass in a multi-pass pipeline — earlier passes already handled copy, structure, and craft. Your ONLY concern is the editorial territory of the skills below. Do not re-litigate structural or copy decisions from earlier passes.

${skillBlocksFor(skills)}

Method — full rewrite with retention:
1. First, build a retention inventory of the draft: every fact, statistic, quote, source attribution, link, named entity, and substantive claim. Every item must survive your rewrite — meanings intact, quoted wording verbatim, no attribution lost, no number changed. Losing or altering any inventory item is a failed pass.
2. Rewrite the piece as deeply as the skills require, but only for the concerns they cover. If a sentence is already clean by these skills' standards, leave it alone.
3. Preserve the original formatting conventions exactly (markdown syntax, headings, line breaks, list structure).
4. Do not let the piece grow: the rewrite should be the same length or tighter, never more than ~10% longer.

Record every meaningful change in the changes array with a short verbatim excerpt of the text you received, the revision, and the rationale, attributing each change to the skill id that motivated it. Group word-level tweaks within one sentence into a single change entry. The edited_text field must contain the COMPLETE rewritten piece from first word to last — never truncate or summarize it. The summary should describe this pass's work in one or two sentences.`;
  }

  function buildEditSystemPrompt(typeLabel, skills, image) {
    const skillBlocks = skillBlocksFor(skills);

    let prompt = `You are a senior marketing copy editor. You are editing a piece classified as: ${typeLabel}.

Apply the editing skills below. Each skill is a set of editorial rules; when you make a change, attribute it to the skill that motivated it (use the skill's id).

${skillBlocks}

Editing principles:
- Preserve the author's meaning, claims, facts, and voice. You are editing, not rewriting.
- Preserve the original formatting conventions exactly (markdown syntax, headings, line breaks, list structure).
- Make every change for a reason you can articulate. If a sentence is already good, leave it alone.
- Record every meaningful change in the changes array with a short verbatim excerpt of the original, the revision, and the rationale. Group word-level tweaks within one sentence into a single change entry.
- The edited_text field must contain the COMPLETE edited piece from first word to last — never truncate or summarize it.`;

    if (image) {
      prompt += `

The draft was provided as a screenshot (${image.width}×${image.height} pixels), and a transcription of its copy is included. Edit the transcription. For each change, also report region: the pixel bounding box of where the ORIGINAL text appears in the screenshot, with the origin at the image's top-left corner. Make boxes tight around the relevant text. If you cannot locate a change in the image, set region to null.`;
    }
    return prompt;
  }

  /**
   * Run one editing pass with streaming (long outputs), returning parsed JSON.
   * input: { text: string (the working text), image?: {base64, mediaType, width, height}, notes?: string }
   * passOpts (optional): { label, regen: true } switches to the deep-edit
   * regeneration prompt (retention inventory, single editorial concern).
   * onProgress receives the running count of characters received.
   */
  async function edit(input, typeLabel, skills, apiKey, onProgress, passOpts) {
    const isRegen = !!(passOpts && passOpts.regen);
    const content = [];
    if (input.image) {
      content.push(imageBlock(input.image));
      let prompt = `Edit the copy in this screenshot. Transcription of the copy:\n\n<draft>\n${input.text}\n</draft>`;
      if (input.notes) prompt += `\n\nNotes from the author:\n${input.notes}`;
      content.push({ type: 'text', text: prompt });
    } else {
      const verb = isRegen ? 'Run your editing pass on this draft' : 'Edit this draft';
      content.push({ type: 'text', text: `${verb}:\n\n<draft>\n${input.text}\n</draft>` });
    }

    const system = isRegen
      ? buildRegenPassSystemPrompt(typeLabel, skills, passOpts.label)
      : buildEditSystemPrompt(typeLabel, skills, input.image);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: headers(apiKey),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 64000,
        stream: true,
        thinking: { type: 'adaptive' },
        system,
        messages: [{ role: 'user', content }],
        output_config: { format: { type: 'json_schema', schema: editSchema(!!input.image) } },
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
