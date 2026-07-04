// Human-approval endpoint for the concierge agent's write actions.
//
//   GET  /api/agents/approvals?sessionId=<uuid>   -> { pending: [...] }
//   POST /api/agents/approvals  { approvalId, decision: 'approve'|'reject' }
//                                              -> executes on approve
//
// SECURITY: if AGENT_APPROVAL_SECRET is set, every request must send a matching
// `x-approval-secret` header (staff-only mode). If unset, the endpoint is open —
// the "approval" is then the user confirming their own submission, equivalent to
// the existing public contact form. Set the secret + rate-limiting before
// exposing staff-only actions in production.

import { Buffer } from 'node:buffer';
import process from 'node:process';
import { setCorsHeaders } from '../_cors.mjs';
import { listPending, decide } from '../../lib/agent/approvals.mjs';

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8') || '{}';
  return JSON.parse(raw);
}

function authorized(req) {
  const need = process.env.AGENT_APPROVAL_SECRET;
  if (!need) return true; // open (user-confirmation) mode
  return req.headers['x-approval-secret'] === need;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    return res.status(204).end();
  }
  setCorsHeaders(req, res);

  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const sessionId =
        req.query?.sessionId || new URL(req.url, 'http://x').searchParams.get('sessionId');
      if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
      return res.status(200).json({ pending: await listPending(sessionId) });
    }

    if (req.method === 'POST') {
      const { approvalId, decision, decidedBy } = await readJson(req);
      if (!approvalId || !['approve', 'reject'].includes(decision)) {
        return res.status(400).json({ error: 'approvalId and decision (approve|reject) required' });
      }
      const result = await decide(approvalId, decision, decidedBy || 'human');
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('approvals error:', err);
    return res.status(500).json({ error: 'Approval failed', detail: err?.message || String(err) });
  }
}
