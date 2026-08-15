// Session + message persistence and tool-call logging (Supabase).
// This is the server-side source of truth for conversation state — we no longer
// trust client-sent history.

import { supabase } from '../supabase/client.mjs';

export async function createSession(language = 'es') {
  const { data, error } = await supabase
    .from('agent_sessions')
    .insert({ language })
    .select('id')
    .single();
  if (error) throw new Error(`createSession: ${error.message}`);
  return data.id;
}

// Load prior user/assistant turns for the model (tool traffic is not replayed).
// Takes the NEWEST `limit` rows (descending + limit), then flips them back into
// chronological order — ordering ascending first would cap the window at the
// oldest turns and freeze the agent's context at the start of the conversation.
export async function loadHistory(sessionId, limit = 20) {
  const { data, error } = await supabase
    .from('agent_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .in('role', ['user', 'assistant'])
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`loadHistory: ${error.message}`);
  return (data ?? []).reverse();
}

export async function saveMessage(sessionId, role, content) {
  const { error } = await supabase
    .from('agent_messages')
    .insert({ session_id: sessionId, role, content });
  if (error) console.error('saveMessage:', error.message);
}

export async function logToolCall(sessionId, toolName, args, result, effect, latencyMs) {
  const { error } = await supabase.from('agent_tool_calls').insert({
    session_id: sessionId,
    tool_name: toolName,
    args,
    result: typeof result === 'string' ? { text: result } : result,
    effect,
    status: 'ok',
    latency_ms: latencyMs,
  });
  if (error) console.error('logToolCall:', error.message);
}
