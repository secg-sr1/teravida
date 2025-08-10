const API_BASE = process.env.UPSTREAM_BASE || 'https://apicellswhyfor.com/items';
const AUTH = process.env.UPSTREAM_TOKEN; // Directus static token or role token

export async function postTo(endpoint, req, res) {
  try {
    // read JSON body (works on Vercel Node runtime)
    const bodyObj = typeof req.body === 'object' && req.body
      ? req.body
      : await new Promise((resolve, reject) => {
          let data = '';
          req.on('data', (c) => (data += c));
          req.on('end', () => {
            try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
          });
          req.on('error', reject);
        });

    // Directus expects { data: {...fields...} }
    const payload = { data: bodyObj };

    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (AUTH) headers.Authorization = `Bearer ${AUTH}`;

    const upstream = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    console.log(endpoint, '→', upstream.status, upstream.statusText, text.slice(0, 300)); // log first chars

    res.status(upstream.status).setHeader('Content-Type', 'application/json').send(text);
  } catch (err) {
    console.error(endpoint, 'proxy error:', err);
    res.status(502).json({ error: 'Upstream request failed' });
  }
}

export function allowCors(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
}
