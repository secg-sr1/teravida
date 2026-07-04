// Cheap, safe smoke test for the agent data + knowledge plumbing.
//
//   npm run smoke
//
// Verifies (without the cost/side-effects of a full ingest):
//   1. env vars are present
//   2. Supabase connects and the service_role key can read `documents`
//   3. OpenAI embeddings work and return the expected 1536 dims
//   4. match_documents() runs (returns rows only after you've ingested)

import './_env.mjs'; // must be first — populates process.env before clients init
import { supabase } from '../lib/supabase/client.mjs';
import { embed } from '../lib/openai/client.mjs';

let failed = false;
const ok = (m) => console.log(`  ✅ ${m}`);
const bad = (m) => { console.log(`  ❌ ${m}`); failed = true; };

async function main() {
  console.log('\n1) Environment');
  for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']) {
    process.env[k] ? ok(`${k} set`) : bad(`${k} MISSING`);
  }
  if (failed) return;

  console.log('\n2) Supabase read (documents count)');
  const { count, error } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });
  if (error) bad(`Supabase error: ${error.message}`);
  else ok(`connected — documents row count: ${count}`);

  console.log('\n3) OpenAI embedding');
  let vec;
  try {
    vec = await embed('¿Qué es la criopreservación de células madre?');
    vec.length === 1536
      ? ok(`embedding length ${vec.length}`)
      : bad(`unexpected embedding length ${vec.length}`);
  } catch (e) {
    bad(`OpenAI error: ${e.message}`);
  }

  console.log('\n4) match_documents() RPC');
  if (vec) {
    const { data, error: rpcErr } = await supabase.rpc('match_documents', {
      query_embedding: vec,
      match_count: 3,
    });
    if (rpcErr) bad(`RPC error: ${rpcErr.message}`);
    else ok(`RPC ok — ${data.length} match(es)` + (data.length === 0 ? ' (empty until you ingest)' : ''));
    data?.forEach((d, i) =>
      console.log(`     ${i + 1}. [${d.source}] sim=${d.similarity?.toFixed(3)} — ${d.content.slice(0, 70)}…`)
    );
  }

  console.log(failed ? '\n❌ Smoke test FAILED\n' : '\n✅ Smoke test passed\n');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error('\n❌ Crashed:', e.message); process.exit(1); });
