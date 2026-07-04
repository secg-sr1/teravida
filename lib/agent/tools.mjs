// Agent tool registry. Each tool has a JSON schema (for OpenAI tool-calling),
// an `effect` flag ('read' auto-runs; 'write' will later require approval), and
// a `run` implementation.

import { embed } from '../openai/client.mjs';
import { supabase } from '../supabase/client.mjs';

// --- knowledgeSearch --------------------------------------------------------
// Retrieval that corrects for the raw-vector bias we observed: generic handbook
// chunks out-rank on-brand institutional facts. We therefore ALWAYS inject the
// top Stem Care facts, then append the best general matches, deduped.
async function knowledgeSearch({ query, k = 5 }) {
  const vec = await embed(query);

  const [inst, gen] = await Promise.all([
    supabase.rpc('match_documents', {
      query_embedding: vec,
      match_count: 3,
      filter: { source: 'stemcare' },
    }),
    supabase.rpc('match_documents', { query_embedding: vec, match_count: k }),
  ]);

  if (inst.error) throw new Error(`knowledgeSearch (stemcare): ${inst.error.message}`);
  if (gen.error) throw new Error(`knowledgeSearch (general): ${gen.error.message}`);

  const seen = new Set();
  const merged = [];
  for (const r of [...(inst.data || []), ...(gen.data || [])]) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    merged.push(r);
  }
  if (!merged.length) return 'No relevant knowledge found.';

  return merged
    .slice(0, 6)
    .map((r, i) => `[${i + 1}] (source=${r.source}, sim=${r.similarity?.toFixed(2)}) ${r.content}`)
    .join('\n\n');
}

export const TOOLS = [
  {
    name: 'knowledgeSearch',
    effect: 'read',
    run: knowledgeSearch,
    schema: {
      type: 'function',
      function: {
        name: 'knowledgeSearch',
        description:
          'Search the Stem Care knowledge base (institutional facts + stem-cell handbook) for grounding facts. Call this before answering any factual, medical, or educational question.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query, in the same language as the user.',
            },
          },
          required: ['query'],
        },
      },
    },
  },
];

export const TOOL_SCHEMAS = TOOLS.map((t) => t.schema);

export async function executeTool(name, args) {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) return `Unknown tool: ${name}`;
  try {
    return await tool.run(args ?? {});
  } catch (err) {
    return `Tool error (${name}): ${err.message}`;
  }
}
