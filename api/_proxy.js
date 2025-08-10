// /api/_proxy.js  (CommonJS)
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

async function postTo(endpoint, req, res) {
  try {
    const bodyObj = await readJson(req);
    const payload = { data: bodyObj }; // Directus shape

    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (AUTH) headers.Authorization = `Bearer ${AUTH}`;
    else console.warn('UPSTREAM_TOKEN not set — upstream likely to return 403');

    const url = `${API_BASE}/${endpoint}`;
    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    console.log(`${endpoint} → ${upstream.status} ${upstream.statusText} body[0..200]=`, text.slice(0, 200));

    // Always pass upstream status/body through so you can see errors
    res.status(upstream.status).setHeader('Content-Type', 'application/json').send(text);
  } catch (err) {
    console.error(`${endpoint} function error:`, err.stack || String(err));
    res.status(500).json({ error: 'Function crashed', detail: err?.message || String(err) });
  }
}

function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
}

module.exports = { postTo, handleCors };
