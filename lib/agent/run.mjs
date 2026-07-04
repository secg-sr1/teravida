// The concierge tool-calling loop. Pure logic (no HTTP) so it is unit-testable
// from a script; api/agents/concierge.js is a thin adapter over this.

import { openai } from '../openai/client.mjs';
import { TOOL_SCHEMAS, executeTool, TOOLS } from './tools.mjs';
import { SYSTEM_CONCIERGE } from './prompt.mjs';
import { loadHistory, saveMessage, logToolCall } from './memory.mjs';

const MODEL = 'gpt-4o-mini';
const MAX_STEPS = 4; // safety bound on tool-call iterations

const effectOf = (name) => TOOLS.find((t) => t.name === name)?.effect ?? 'read';

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
        onEvent({ type: 'tool', name: tc.function.name, args });

        const started = Date.now();
        const result = await executeTool(tc.function.name, args);
        if (sessionId) {
          await logToolCall(
            sessionId,
            tc.function.name,
            args,
            result,
            effectOf(tc.function.name),
            Date.now() - started
          );
        }
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: typeof result === 'string' ? result : JSON.stringify(result),
        });
      }
      continue; // let the model read the tool output
    }

    const text = msg.content ?? '';
    if (sessionId) await saveMessage(sessionId, 'assistant', text);
    return { text, steps: step };
  }

  return { text: 'No pude completar la respuesta en esta ocasión.', steps: MAX_STEPS };
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
    const toolCalls = []; // indexed by tool_call.index; { id, name, arguments }

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        content += delta.content;
        onToken(delta.content);
      }
      for (const tcd of delta.tool_calls ?? []) {
        const i = tcd.index;
        toolCalls[i] ??= { id: '', name: '', arguments: '' };
        if (tcd.id) toolCalls[i].id = tcd.id;
        if (tcd.function?.name) toolCalls[i].name += tcd.function.name;
        if (tcd.function?.arguments) toolCalls[i].arguments += tcd.function.arguments;
      }
    }

    if (toolCalls.length) {
      messages.push({
        role: 'assistant',
        content: content || null,
        tool_calls: toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: { name: tc.name, arguments: tc.arguments },
        })),
      });

      for (const tc of toolCalls) {
        let args = {};
        try {
          args = JSON.parse(tc.arguments || '{}');
        } catch {
          /* leave empty */
        }
        onEvent({ type: 'tool', name: tc.name, args });

        const started = Date.now();
        const result = await executeTool(tc.name, args);
        if (sessionId) {
          await logToolCall(sessionId, tc.name, args, result, effectOf(tc.name), Date.now() - started);
        }
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: typeof result === 'string' ? result : JSON.stringify(result),
        });
      }
      continue;
    }

    if (sessionId) await saveMessage(sessionId, 'assistant', content);
    return { text: content, steps: step };
  }

  return { text: '', steps: MAX_STEPS };
}
