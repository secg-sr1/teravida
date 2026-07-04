// One-off knowledge ingestion for the RAG `documents` table.
//
//   npm run ingest
//
// Downloads the stem-cell handbook PDF, chunks it, embeds every chunk plus the
// institutional baseFacts with OpenAI, and upserts into Supabase. Re-running is
// safe: rows for each source are cleared before re-insert.
//
// Requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY in
// .env.local (or .env / the shell environment).

import './_env.mjs'; // must be first — populates process.env before clients init

import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

import { supabase } from '../lib/supabase/client.mjs';
import { embedBatch } from '../lib/openai/client.mjs';
import { BASE_FACTS_ES, BASE_FACTS_EN, bulletsOf } from '../lib/knowledge/baseFacts.mjs';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const HANDBOOK_URL =
  process.env.HANDBOOK_URL ||
  'https://ifctp.org/download/Books%20of%20Cell%20&%20Stem%20Cell%20Therapy/Stem%20cells%20handbook.pdf';

const CACHE_DIR = path.join('scripts', '.cache');
const CACHE_PDF = path.join(CACHE_DIR, 'handbook.pdf');

const CHUNK_SIZE = 1200; // characters
const CHUNK_OVERLAP = 200;
const EMBED_BATCH = 50; // chunks per OpenAI request

function requireEnv() {
  const missing = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY'].filter(
    (k) => !process.env[k]
  );
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(', ')}. Set them in .env.local.`);
    process.exit(1);
  }
}

async function getPdfBuffer() {
  try {
    const cached = await fs.readFile(CACHE_PDF);
    console.log(`Using cached PDF (${cached.length} bytes).`);
    return cached;
  } catch {
    /* not cached — download */
  }
  console.log(`Downloading handbook: ${HANDBOOK_URL}`);
  const res = await fetch(HANDBOOK_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(CACHE_PDF, buf);
  console.log(`Downloaded ${buf.length} bytes → ${CACHE_PDF}`);
  return buf;
}

function chunkText(text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  for (let i = 0; i < clean.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
    const piece = clean.slice(i, i + CHUNK_SIZE).trim();
    if (piece.length > 50) chunks.push(piece);
  }
  return chunks;
}

// Build the full list of { content, source, title, metadata } rows to embed.
async function buildRecords() {
  const records = [];

  // 1) Institutional facts — one row per bullet, ES + EN.
  for (const [lang, block] of [['es', BASE_FACTS_ES], ['en', BASE_FACTS_EN]]) {
    for (const bullet of bulletsOf(block)) {
      records.push({
        content: bullet,
        source: 'stemcare',
        title: `baseFacts (${lang})`,
        metadata: { source: 'stemcare', lang },
      });
    }
  }

  // 2) Handbook PDF — chunked.
  const buf = await getPdfBuffer();
  const parsed = await pdfParse(buf);
  const chunks = chunkText(parsed.text || '');
  console.log(`Parsed handbook: ${chunks.length} chunks.`);
  chunks.forEach((content, i) => {
    records.push({
      content,
      source: 'handbook',
      title: 'Stem Cells Handbook',
      metadata: { source: 'handbook', chunk: i },
    });
  });

  return records;
}

async function clearSources(sources) {
  for (const s of sources) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .filter('metadata->>source', 'eq', s);
    if (error) throw new Error(`Clearing source "${s}" failed: ${error.message}`);
  }
}

async function main() {
  requireEnv();

  const records = await buildRecords();
  console.log(`Prepared ${records.length} records. Clearing old rows…`);
  await clearSources(['stemcare', 'handbook']);

  let inserted = 0;
  for (let i = 0; i < records.length; i += EMBED_BATCH) {
    const batch = records.slice(i, i + EMBED_BATCH);
    const embeddings = await embedBatch(batch.map((r) => r.content));
    const rows = batch.map((r, j) => ({ ...r, embedding: embeddings[j] }));

    const { error } = await supabase.from('documents').insert(rows);
    if (error) throw new Error(`Insert failed at batch ${i}: ${error.message}`);

    inserted += rows.length;
    console.log(`Inserted ${inserted}/${records.length}…`);
  }

  console.log(`\n✅ Done. ${inserted} documents embedded and stored.`);
}

main().catch((err) => {
  console.error('\n❌ Ingest failed:', err.message);
  process.exit(1);
});
