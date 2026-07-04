// Server-only Directus write client. Decoupled from HTTP (unlike api/_proxy.js's
// postTo, which needs req/res) so agent tools can call it directly.
// Directus stays the lead system-of-record.

const API_BASE = process.env.UPSTREAM_BASE || 'https://apicellswhyfor.com/items';
const AUTH = process.env.UPSTREAM_TOKEN;

/** Insert one record into a Directus collection. Returns the created item. */
export async function createRecord(collection, data) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (AUTH) headers.Authorization = `Bearer ${AUTH}`;
  else console.warn('[directus] UPSTREAM_TOKEN not set — upstream likely to return 403');

  const res = await fetch(`${API_BASE}/${collection}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data }), // Directus shape
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Directus ${res.status} on ${collection}: ${text.slice(0, 200)}`);
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
