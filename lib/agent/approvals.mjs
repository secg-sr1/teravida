// Human-approval workflow for write-effect tools.
//
// Write tools do NOT execute when the model calls them — the run loop records a
// PENDING approval here instead. A human then approves (execute) or rejects via
// api/agents/approvals.js. This keeps the agent from autonomously registering
// leads / sending email.
//
// Supabase is optional. Without it approvals cannot be persisted, so
// createApproval returns null and the run loop refuses the write outright
// rather than promising something it cannot deliver.

import { supabase, supabaseConfigured, trySupabase } from '../supabase/client.mjs';
import { TOOLS } from './tools.mjs';
import { logToolCall } from './memory.mjs';

// A serverless function cannot outlive this, so an 'executing' row older than
// the window means the invocation died mid-run and will never finish.
const STALE_EXECUTING_MS = 2 * 60 * 1000;

/** @returns {Promise<number|null>} approval id, or null when unavailable. */
export async function createApproval(sessionId, proposedAction) {
  const row = await trySupabase(
    'createApproval',
    () =>
      supabase
        .from('agent_approvals')
        .insert({ session_id: sessionId, proposed_action: proposedAction })
        .select('id')
        .single(),
    null
  );
  return row?.id ?? null;
}

export async function listPending(sessionId) {
  return await trySupabase(
    'listPending',
    () =>
      supabase
        .from('agent_approvals')
        .select('id, proposed_action, status, created_at')
        .eq('session_id', sessionId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true }),
    []
  );
}

/**
 * Approve (execute the underlying tool) or reject a pending approval.
 * @returns {Promise<{status:string, result?:any, note?:string}>}
 */
export async function decide(approvalId, decision, decidedBy = 'human', sessionId = null) {
  if (!supabaseConfigured) return { status: 'unavailable', note: 'approval storage not configured' };

  const appr = await trySupabase(
    'decide/fetch',
    () => supabase.from('agent_approvals').select('*').eq('id', approvalId).single(),
    null
  );
  if (!appr) return { status: 'unavailable', note: 'approval not found or storage unreachable' };

  // Session scoping: a caller may only act on approvals from its own session
  // (sessionId is an unguessable UUID). Skipped for trusted server-side callers
  // that pass no sessionId.
  if (sessionId && appr.session_id !== sessionId) {
    return { status: 'forbidden', note: 'session mismatch' };
  }

  const stamp = { decided_by: decidedBy, decided_at: new Date().toISOString() };

  // The read above is only an early-out. The real guard is the conditional update
  // below: `.eq('status','pending')` makes the claim atomic, so of two concurrent
  // or retried decisions exactly one gets a row back. Without it both callers pass
  // the check and the write tool runs twice — a duplicate lead or duplicate email.
  const claim = async (nextStatus) => {
    const rows = await trySupabase(
      'decide/claim',
      () =>
        supabase
          .from('agent_approvals')
          .update({ status: nextStatus, ...stamp })
          .eq('id', approvalId)
          .eq('status', 'pending')
          .select('id'),
      []
    );
    return rows.length > 0;
  };

  // Lost the race — report whatever the winner set it to, not a stale guess.
  const lostClaim = async () => {
    const row = await trySupabase(
      'decide/reread',
      () => supabase.from('agent_approvals').select('status').eq('id', approvalId).single(),
      null
    );
    return { status: row?.status ?? 'unknown', note: 'already decided' };
  };

  // An invocation that died between claiming 'executing' and writing its result
  // would otherwise strand the row forever: it is no longer 'pending', so no
  // retry can claim it, and listPending hides it. Sweep it to 'error' WITHOUT
  // re-running the tool — the write may well have succeeded before the kill, and
  // re-running it is exactly the duplicate this module exists to prevent.
  if (appr.status === 'executing') {
    const age = Date.now() - new Date(appr.decided_at ?? appr.created_at).getTime();
    if (age < STALE_EXECUTING_MS) return { status: 'executing', note: 'in progress' };
    await trySupabase(
      'decide/sweep-stale',
      () =>
        supabase
          .from('agent_approvals')
          .update({ status: 'error', ...stamp })
          .eq('id', approvalId)
          .eq('status', 'executing')
          .select('id'),
      []
    );
    return { status: 'error', note: 'previous execution did not complete; not retried' };
  }

  if (appr.status !== 'pending') return { status: appr.status, note: 'already decided' };

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
    await trySupabase(
      'decide/mark-error',
      () => supabase.from('agent_approvals').update({ status: 'error', ...stamp }).eq('id', approvalId).select('id'),
      []
    );
    await logToolCall(appr.session_id, tool, args, { error: e.message }, 'write', Date.now() - started, 'error');
    throw new Error(`execution failed: ${e.message}`);
  }

  // The tool already ran. If this update fails the row stays 'executing' and the
  // sweeper above will later mark it 'error' — surfaced, and never re-executed.
  const marked = await trySupabase(
    'decide/mark-approved',
    () => supabase.from('agent_approvals').update({ status: 'approved', ...stamp }).eq('id', approvalId).select('id'),
    []
  );
  if (!marked.length) {
    console.error(`[approvals] ${approvalId}: tool ran but status update failed; row left 'executing'`);
  }
  await logToolCall(appr.session_id, tool, args, result, 'write', Date.now() - started, 'ok');
  return { status: 'approved', result };
}
