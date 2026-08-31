// Session + message persistence and tool-call logging (Supabase).
// This is the server-side source of truth for conversation state — we no longer
// trust client-sent history.
//
// Every function here degrades instead of throwing: Supabase is optional, so a
// missing or unreachable project costs the agent its memory, not the request.
// createSession returns null, and a null sessionId means "run stateless".

import { supabase, trySupabase } from '../supabase/client.mjs';

/** @returns {Promise<string|null>} session id, or null when unavailable. */
export async function createSession(language = 'es') {
  const row = await trySupabase(
    'createSession',
    () => supabase.from('agent_sessions').insert({ language }).select('id').single(),
    null
  );
  return row?.id ?? null;
}

// Load prior user/assistant turns for the model (tool traffic is not replayed).
// Takes the NEWEST `limit` rows (descending + limit), then flips them back into
// chronological order — ordering ascending first would cap the window at the
// oldest turns and freeze the agent's context at the start of the conversation.
export async function loadHistory(sessionId, limit = 20) {
  if (!sessionId) return [];
  const rows = await trySupabase(
    'loadHistory',
    () =>
      supabase
        .from('agent_messages')
        .select('role, content')
        .eq('session_id', sessionId)
        .in('role', ['user', 'assistant'])
        .order('created_at', { ascending: false })
        .limit(limit),
    []
  );
  return [...rows].reverse();
}

export async function saveMessage(sessionId, role, content) {
  if (!sessionId) return;
  await trySupabase(
    'saveMessage',
    () => supabase.from('agent_messages').insert({ session_id: sessionId, role, content }),
    null
  );
}

/**
 * @param {'ok'|'error'} status — callers that log a failure must pass 'error',
 *   otherwise a broken tool run is indistinguishable from a healthy one.
 */
export async function logToolCall(sessionId, toolName, args, result, effect, latencyMs, status = 'ok') {
  if (!sessionId) return;
  await trySupabase(
    'logToolCall',
    () =>
      supabase.from('agent_tool_calls').insert({
        session_id: sessionId,
        tool_name: toolName,
        args,
        result: typeof result === 'string' ? { text: result } : result,
        effect,
        status,
        latency_ms: latencyMs,
      }),
    null
  );
}
