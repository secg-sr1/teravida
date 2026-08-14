import { setCorsHeaders } from './_cors.mjs';

const API_BASE = process.env.UPSTREAM_BASE || 'https://apicellswhyfor.com/items';
const AUTH = process.env.UPSTREAM_TOKEN;

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(new Error('Invalid JSON body: ' + e.message)); }
    });
    req.on('error', reject);
  });
}

export async function postTo(endpoint, req, res) {
  try {
    const bodyObj = await readJson(req);
    const payload = { data: bodyObj }; // Directus shape

    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (AUTH) headers.Authorization = `Bearer ${AUTH}`;
    else console.warn('UPSTREAM_TOKEN not set — upstream likely to return 403');

    const url = `${API_BASE}/${endpoint}`;
    const upstream = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });

    const text = await upstream.text();
    console.log(`${endpoint} → ${upstream.status} ${upstream.statusText} ::`, text.slice(0, 200));

    setCorsHeaders(req, res);
    res.status(upstream.status).setHeader('Content-Type', 'application/json').send(text);
  } catch (err) {
    console.error(`${endpoint} function error:`, err.stack || String(err));
    // Without these the browser reports an opaque CORS failure instead of the
    // error body, now that the allow-origin is an allowlist rather than '*'.
    setCorsHeaders(req, res);
    res.status(500).json({ error: 'Function crashed', detail: err?.message || String(err) });
  }
}

export function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    return res.status(200).end();
  }
}

// 405 responses need the CORS headers too, for the same reason as the catch above.
export function methodNotAllowed(req, res) {
  setCorsHeaders(req, res);
  return res.status(405).json({ error: 'Method Not Allowed' });
}
