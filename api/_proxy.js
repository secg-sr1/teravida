const API_BASE = process.env.UPSTREAM_BASE || 'https://apicellswhyfor.com/items';
const AUTH = process.env.UPSTREAM_TOKEN;

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

async function postTo(endpoint, req, res) {
  try {
    const bodyObj = await readJson(req);
    const payload = { data: bodyObj }; // Directus expects { data: {...} }

    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (AUTH) headers.Authorization = `Bearer ${AUTH}`;
    else console.warn('UPSTREAM_TOKEN not set — upstream may return 403');

    const upstream = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    console.log(`${endpoint} → ${upstream.status} ${upstream.statusText} :: ${text.slice(0, 180)}`);

    res.status(upstream.status).setHeader('Content-Type', 'application/json').send(text);
  } catch (err) {
    console.error(`${endpoint} proxy error:`, err);
    res.status(500).json({ error: 'Function crashed', detail: String(err) });
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
