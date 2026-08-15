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
export async function decide(approvalId, decision, decidedBy = 'human', sessionId = null) {
  const { data: appr, error } = await supabase
    .from('agent_approvals')
    .select('*')
    .eq('id', approvalId)
    .single();
  if (error) throw new Error(`decide/fetch: ${error.message}`);

  // Session scoping: a caller may only act on approvals from its own session
  // (sessionId is an unguessable UUID). Skipped for trusted server-side callers
  // that pass no sessionId.
  if (sessionId && appr.session_id !== sessionId) {
    return { status: 'forbidden', note: 'session mismatch' };
  }
  if (appr.status !== 'pending') return { status: appr.status, note: 'already decided' };

  const stamp = { decided_by: decidedBy, decided_at: new Date().toISOString() };

  // The read above is only an early-out. The real guard is the conditional update
  // below: `.eq('status','pending')` makes the claim atomic, so of two concurrent
  // or retried decisions exactly one gets a row back. Without it both callers pass
  // the check and the write tool runs twice — a duplicate lead or duplicate email.
  const claim = async (nextStatus) => {
    const { data, error: claimErr } = await supabase
      .from('agent_approvals')
      .update({ status: nextStatus, ...stamp })
      .eq('id', approvalId)
      .eq('status', 'pending')
      .select('id');
    if (claimErr) throw new Error(`decide/claim: ${claimErr.message}`);
    return (data ?? []).length > 0;
  };

  // Lost the race — report whatever the winner set it to, not a stale guess.
  const lostClaim = async () => {
    const { data } = await supabase
      .from('agent_approvals')
      .select('status')
      .eq('id', approvalId)
      .single();
    return { status: data?.status ?? 'unknown', note: 'already decided' };
  };

  if (decision === 'reject') {
    if (!(await claim('rejected'))) return await lostClaim();
    return { status: 'rejected' };
  }

  // approve → execute the underlying tool
  const { tool, args } = appr.proposed_action || {};
  const t = TOOLS.find((x) => x.name === tool);
  if (!t) throw new Error(`Unknown tool in approval: ${tool}`);
  if (t.effect !== 'write') throw new Error(`Tool ${tool} is not a write tool`);

  // Claim BEFORE executing: 'executing' is a transient status that is neither
  // pending (so it is not re-listed or re-claimable) nor a final decision.
  if (!(await claim('executing'))) return await lostClaim();

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
