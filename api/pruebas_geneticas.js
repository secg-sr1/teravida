// const API_BASE = process.env.UPSTREAM_BASE || 'https://apicellswhyfor.com/items';
// const AUTH = process.env.UPSTREAM_TOKEN;

// export default async function handler(req, res) {
//   if (req.method === 'OPTIONS') {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     return res.status(200).end();
//   }
//   if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

//   try {
//     const body = typeof req.body === 'object' && req.body ? req.body : await new Promise((resolve, reject) => {
//       let data = ''; req.on('data', c => data += c);
//       req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }});
//       req.on('error', reject);
//     });

//     const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
//     if (AUTH) headers.Authorization = `Bearer ${AUTH}`;

//     const upstream = await fetch(`${API_BASE}/pruebas_geneticas`, { method: 'POST', headers, body: JSON.stringify(body) });
//     const text = await upstream.text();
//     console.log('pruebas_geneticas upstream status:', upstream.status, upstream.statusText);
//     res.status(upstream.status).setHeader('Content-Type', 'application/json').send(text);
//   } catch (err) {
//     console.error('pruebas_geneticas proxy error:', err);
//     res.status(502).json({ error: 'Upstream request failed' });
//   }
// }


import { allowCors, postTo } from './_proxy';

export default async function handler(req, res) {
  if (allowCors && req.method === 'OPTIONS') return allowCors(req, res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  return postTo('pruebas_geneticas', req, res);
}
