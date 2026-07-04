// Human-approval workflow for write-effect tools.
//
// Write tools do NOT execute when the model calls them — the run loop records a
// PENDING approval here instead. A human then approves (execute) or rejects via
// api/agents/approvals.js. This keeps the agent from autonomously mutating
// Directus / sending email.

import { supabase } from '../supabase/client.mjs';
import { TOOLS } from './tools.mjs';
import { logToolCall } from './memory.mjs';

export async function createApproval(sessionId, proposedAction) {
  const { data, error } = await supabase
    .from('agent_approvals')
    .insert({ session_id: sessionId, proposed_action: proposedAction })
    .select('id')
    .single();
  if (error) throw new Error(`createApproval: ${error.message}`);
  return data.id;
}

export async function listPending(sessionId) {
  const { data, error } = await supabase
    .from('agent_approvals')
    .select('id, proposed_action, status, created_at')
    .eq('session_id', sessionId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw new Error(`listPending: ${error.message}`);
  return data ?? [];
}

/**
 * Approve (execute the underlying tool) or reject a pending approval.
 * @returns {Promise<{status:string, result?:any, note?:string}>}
 */
export async function decide(approvalId, decision, decidedBy = 'human') {
  const { data: appr, error } = await supabase
    .from('agent_approvals')
    .select('*')
    .eq('id', approvalId)
    .single();
  if (error) throw new Error(`decide/fetch: ${error.message}`);
  if (appr.status !== 'pending') return { status: appr.status, note: 'already decided' };

  const stamp = { decided_by: decidedBy, decided_at: new Date().toISOString() };

  if (decision === 'reject') {
    await supabase.from('agent_approvals').update({ status: 'rejected', ...stamp }).eq('id', approvalId);
    return { status: 'rejected' };
  }

  // approve → execute the underlying tool
  const { tool, args } = appr.proposed_action || {};
  const t = TOOLS.find((x) => x.name === tool);
  if (!t) throw new Error(`Unknown tool in approval: ${tool}`);
  if (t.effect !== 'write') throw new Error(`Tool ${tool} is not a write tool`);

  const started = Date.now();
  let result;
  try {
    result = await t.run(args);
  } catch (e) {
    await supabase.from('agent_approvals').update({ status: 'error', ...stamp }).eq('id', approvalId);
    await logToolCall(appr.session_id, tool, args, { error: e.message }, 'write', Date.now() - started).catch(() => {});
    throw new Error(`execution failed: ${e.message}`);
  }

  await supabase.from('agent_approvals').update({ status: 'approved', ...stamp }).eq('id', approvalId);
  await logToolCall(appr.session_id, tool, args, result, 'write', Date.now() - started).catch(() => {});
  return { status: 'approved', result };
}
