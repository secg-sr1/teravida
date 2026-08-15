// The concierge tool-calling loop. Pure logic (no HTTP) so it is unit-testable
// from a script; api/agents/concierge.js is a thin adapter over this.

import { openai } from '../openai/client.mjs';
import { TOOL_SCHEMAS, executeTool, TOOLS, summarizeAction } from './tools.mjs';
import { SYSTEM_CONCIERGE } from './prompt.mjs';
import { loadHistory, saveMessage, logToolCall } from './memory.mjs';
import { createApproval } from './approvals.mjs';

const MODEL = 'gpt-4o-mini';
const MAX_STEPS = 4; // safety bound on tool-call iterations

// Shown when the tool-call loop hits MAX_STEPS without producing a final answer.
// Both entry points must return SOMETHING: an empty string reaches the client as
// a 200 with a zero-byte body, which renders as a blank bubble and no error.
const exhaustedText = (language) =>
  language === 'en'
    ? "I couldn't complete the answer this time. Please try rephrasing your question."
    : 'No pude completar la respuesta en esta ocasión. Intenta reformular tu pregunta.';

const effectOf = (name) => TOOLS.find((t) => t.name === name)?.effect ?? 'read';

// Read tools run immediately; write tools are recorded as PENDING approvals and
// NOT executed. Returns the string fed back to the model as the tool result.
async function executeOrPropose({ sessionId, name, args, onEvent }) {
  const effect = effectOf(name);
  onEvent({ type: 'tool', name, args, effect });

  if (effect === 'write') {
    const summary = summarizeAction(name, args);
    let approvalId = null;
    if (sessionId) approvalId = await createApproval(sessionId, { tool: name, args, summary });
    onEvent({ type: 'proposal', name, args, summary, approvalId });
    return (
      `ACCIÓN PENDIENTE DE APROBACIÓN (id=${approvalId ?? 'n/a'}): ${summary}. ` +
      `NO se ha ejecutado. Informa al usuario que su solicitud quedó preparada y ` +
      `requiere su confirmación; NO afirmes que ya se completó.`
    );
  }

  const started = Date.now();
  const result = await executeTool(name, args);
  if (sessionId) await logToolCall(sessionId, name, args, result, effect, Date.now() - started);
  return typeof result === 'string' ? result : JSON.stringify(result);
}

/**
 * @param {object}   p
 * @param {string}   p.userMessage
 * @param {string}   [p.language]  'es' | 'en'
 * @param {string}   [p.sessionId] when set, history is loaded and turns persisted
 * @param {function} [p.onEvent]   ({type:'tool', name, args}) progress callback
 * @returns {Promise<{text:string, steps:number}>}
 */
export async function runConcierge({ userMessage, language = 'es', sessionId = null, onEvent = () => {} }) {
  const history = sessionId ? await loadHistory(sessionId) : [];
  const messages = [
    { role: 'system', content: SYSTEM_CONCIERGE(language) },
    ...history,
    { role: 'user', content: userMessage },
  ];
  if (sessionId) await saveMessage(sessionId, 'user', userMessage);

  for (let step = 1; step <= MAX_STEPS; step++) {
    const res = await openai.chat.completions.create({
      model: MODEL,
      messages,
      tools: TOOL_SCHEMAS,
      temperature: 0.3,
    });

    const msg = res.choices[0].message;
    messages.push(msg);

    if (msg.tool_calls?.length) {
      for (const tc of msg.tool_calls) {
        let args = {};
        try {
          args = JSON.parse(tc.function.arguments || '{}');
        } catch {
          /* leave args empty */
        }
        const content = await executeOrPropose({ sessionId, name: tc.function.name, args, onEvent });
        messages.push({ role: 'tool', tool_call_id: tc.id, content });
      }
      continue; // let the model read the tool output
    }

    const text = msg.content ?? '';
    if (sessionId) await saveMessage(sessionId, 'assistant', text);
    return { text, steps: step };
  }

  return { text: exhaustedText(language), steps: MAX_STEPS };
}

/**
 * Streaming variant: tool-call turns run silently; the final answer's tokens are
 * emitted via onToken as they arrive. Same memory/logging as runConcierge.
 *
 * @param {object}   p
 * @param {string}   p.userMessage
 * @param {string}   [p.language]
 * @param {string}   [p.sessionId]
 * @param {function} [p.onToken]  (tokenString) => void
 * @param {function} [p.onEvent]  ({type:'tool', name, args}) => void
 * @returns {Promise<{text:string, steps:number}>}
 */
export async function runConciergeStream({
  userMessage,
  language = 'es',
  sessionId = null,
  onToken = () => {},
  onEvent = () => {},
}) {
  const history = sessionId ? await loadHistory(sessionId) : [];
  const messages = [
    { role: 'system', content: SYSTEM_CONCIERGE(language) },
    ...history,
    { role: 'user', content: userMessage },
  ];
  if (sessionId) await saveMessage(sessionId, 'user', userMessage);

  for (let step = 1; step <= MAX_STEPS; step++) {
    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages,
      tools: TOOL_SCHEMAS,
      temperature: 0.3,
      stream: true,
    });

    let content = '';
    const toolCalls = []; // sparse: indexed by tool_call.index; { id, name, arguments }
    // Once this step is known to be a tool-call turn it must stop emitting to the
    // user — otherwise the model's pre-tool preamble is streamed and then
    // concatenated with the real answer from the next step.
    let isToolStep = false;
    // Emission runs one delta behind: a tool_calls delta that arrives just after a
    // short preamble can then discard it before the user ever sees it. Without the
    // lookahead, anything emitted before the first tool_calls delta is already
    // gone. A full fix would buffer the entire step, which would end streaming.
    let pending = '';

    const flushPending = () => {
      if (pending && !isToolStep) onToken(pending);
      pending = '';
    };

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (!delta) continue;

      if (delta.tool_calls?.length) {
        isToolStep = true;
        pending = ''; // drop the held preamble; this turn runs silently
      }

      if (delta.content) {
        content += delta.content;
        if (!isToolStep) {
          flushPending();          // release the previous delta
          pending = delta.content; // hold the newest one
        }
      }
      for (const tcd of delta.tool_calls ?? []) {
        const i = tcd.index;
        toolCalls[i] ??= { id: '', name: '', arguments: '' };
        if (tcd.id) toolCalls[i].id = tcd.id;
        if (tcd.function?.name) toolCalls[i].name += tcd.function.name;
        if (tcd.function?.arguments) toolCalls[i].arguments += tcd.function.arguments;
      }
    }
    flushPending(); // stream ended with no tool call: release the held tail

    // `toolCalls` is keyed by the provider's index, so a gap leaves holes that
    // would throw on access. Compact before use.
    const calls = toolCalls.filter(Boolean);

    if (calls.length) {
      messages.push({
        role: 'assistant',
        content: content || null,
        tool_calls: calls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: { name: tc.name, arguments: tc.arguments },
        })),
      });

      for (const tc of calls) {
        let args = {};
        try {
          args = JSON.parse(tc.arguments || '{}');
        } catch {
          /* leave empty */
        }
        const content = await executeOrPropose({ sessionId, name: tc.name, args, onEvent });
        messages.push({ role: 'tool', tool_call_id: tc.id, content });
      }
      continue;
    }

    if (sessionId) await saveMessage(sessionId, 'assistant', content);
    return { text: content, steps: step };
  }

  // Loop exhausted: emit the fallback so the streaming client receives a body.
  const exhausted = exhaustedText(language);
  onToken(exhausted);
  if (sessionId) await saveMessage(sessionId, 'assistant', exhausted);
  return { text: exhausted, steps: MAX_STEPS };
}
