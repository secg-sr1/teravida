// Concierge agent endpoint — streams the answer as text/plain (mirrors
// api/chat/stream.js so the frontend consumes it identically). The session id
// is returned in the X-Session-Id response header.
//
// POST /api/agents/concierge
//   body: { message: string, language?: 'es'|'en', sessionId?: uuid }
//   res:  streamed text/plain tokens; header X-Session-Id

import { setCorsHeaders } from '../_cors.mjs';
import { runConciergeStream } from '../../lib/agent/run.mjs';
import { createSession } from '../../lib/agent/memory.mjs';

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8') || '{}';
  return JSON.parse(raw);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, language = 'es', sessionId } = await readJson(req);
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    const sid = sessionId || (await createSession(language));

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Session-Id', sid);
    setCorsHeaders(req, res);
    res.setHeader('Access-Control-Expose-Headers', 'X-Session-Id');
    res.status(200);

    await runConciergeStream({
      userMessage: String(message),
      language,
      sessionId: sid,
      onToken: (t) => res.write(t),
    });
    res.end();
  } catch (err) {
    console.error('concierge error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Agent failed', detail: err?.message || String(err) });
    } else {
      res.end();
    }
  }
}
