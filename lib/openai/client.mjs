// Shared server-only OpenAI client. The chat endpoint (api/chat/stream.js)
// still streams via raw fetch; this client is for embeddings and, later,
// the tool-calling agent loop.

import OpenAI from 'openai';

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1536 dims — must match the vector(1536) column in supabase/schema.sql.
export const EMBEDDING_MODEL = 'text-embedding-3-small';

/** Embed a single string. Returns a number[] of length 1536. */
export async function embed(text) {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

/** Embed many strings in one request. Returns number[][] aligned to input order. */
export async function embedBatch(texts) {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}
