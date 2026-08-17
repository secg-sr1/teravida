// Agent tool registry. Each tool has a JSON schema (for OpenAI tool-calling),
// an `effect` flag ('read' auto-runs; 'write' is proposed and requires human
// approval before `run` is executed — see lib/agent/approvals.mjs), and a `run`
// implementation.

import { embed } from '../openai/client.mjs';
import { supabase, supabaseConfigured } from '../supabase/client.mjs';
import { BASE_FACTS_ES, BASE_FACTS_EN } from '../knowledge/baseFacts.mjs';
import { createRecord } from '../directus/client.mjs';
import { sendTeamEmail } from '../email/send.mjs';

// --- knowledgeSearch (read) -------------------------------------------------
// Corrects for raw-vector bias (generic handbook chunks out-rank on-brand
// institutional facts): ALWAYS injects top Stem Care facts, then general hits.
//
// Vector search needs Supabase. When it is unconfigured or unreachable this
// falls back to the static institutional facts so the agent still answers
// on-brand instead of failing the turn — narrower, but never wrong.
function staticFacts(language) {
  const block = language === 'en' ? BASE_FACTS_EN : BASE_FACTS_ES;
  return (
    `[knowledge base unavailable — answering from institutional facts only]\n\n` +
    block.trim()
  );
}

async function knowledgeSearch({ query, k = 5 }, { language = 'es' } = {}) {
  if (!supabaseConfigured) return staticFacts(language);

  let inst, gen;
  try {
    const vec = await embed(query);
    [inst, gen] = await Promise.all([
      supabase.rpc('match_documents', {
        query_embedding: vec,
        match_count: 3,
        filter: { source: 'stemcare' },
      }),
      supabase.rpc('match_documents', { query_embedding: vec, match_count: k }),
    ]);
  } catch (err) {
    console.error(`[knowledgeSearch] unreachable, using static facts: ${err.message}`);
    return staticFacts(language);
  }

  if (inst.error || gen.error) {
    console.error(`[knowledgeSearch] ${(inst.error || gen.error).message}`);
    return staticFacts(language);
  }

  const seen = new Set();
  const merged = [];
  for (const r of [...(inst.data || []), ...(gen.data || [])]) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    merged.push(r);
  }
  if (!merged.length) return staticFacts(language);

  return merged
    .slice(0, 6)
    .map((r, i) => `[${i + 1}] (source=${r.source}, sim=${r.similarity?.toFixed(2)}) ${r.content}`)
    .join('\n\n');
}

// --- createLead (write) -----------------------------------------------------
// Maps a service to its Directus collection and inserts only whitelisted fields
// (prevents 400s from unknown columns). Executed ONLY after human approval.
const LEAD_COLLECTIONS = ['criopreservacion', 'pruebas_geneticas', 'terapia_celular'];
const LEAD_FIELDS = {
  criopreservacion: [
    'nombre', 'apellidos', 'email', 'telefono',
    'nombre_de_ginecologo', 'telefonos_de_contacto', 'hospital_donde_se_atendera', 'mensaje',
  ],
  pruebas_geneticas: ['nombre', 'apellidos', 'email', 'telefono', 'mensaje'],
  terapia_celular: ['nombre', 'apellidos', 'email', 'telefono', 'mensaje'],
};

async function createLead(args) {
  const { service } = args;
  if (!LEAD_COLLECTIONS.includes(service)) throw new Error(`Invalid service: ${service}`);
  if (!args.nombre || !args.email) throw new Error('nombre and email are required');

  const data = {};
  for (const f of LEAD_FIELDS[service]) {
    const v = args[f];
    if (v !== undefined && v !== null && String(v).trim() !== '') data[f] = v;
  }

  const res = await createRecord(service, data);
  return { ok: true, collection: service, id: res?.data?.id ?? null, data };
}

// --- sendEmail (write, internal only) ---------------------------------------
async function sendEmail({ subject, message }) {
  if (!subject || !message) throw new Error('subject and message are required');
  const res = await sendTeamEmail({ subject, text: message });
  return { ok: true, id: res.id, to: res.to };
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
          'Search the Stem Care knowledge base (institutional facts + stem-cell handbook) for grounding facts. Call before answering any factual, medical, or educational question.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query, in the same language as the user.' },
          },
          required: ['query'],
        },
      },
    },
  },
  {
    name: 'createLead',
    effect: 'write',
    run: createLead,
    schema: {
      type: 'function',
      function: {
        name: 'createLead',
        description:
          'Registra una solicitud de contacto/lead del usuario en Directus. REQUIERE confirmación humana antes de ejecutarse. Úsala cuando el usuario quiera ser contactado, agendar una cita o dejar sus datos. No inventes datos.',
        parameters: {
          type: 'object',
          properties: {
            service: { type: 'string', enum: LEAD_COLLECTIONS, description: 'Servicio de interés' },
            nombre: { type: 'string' },
            apellidos: { type: 'string' },
            email: { type: 'string' },
            telefono: { type: 'string' },
            mensaje: { type: 'string' },
            nombre_de_ginecologo: { type: 'string', description: 'Solo criopreservacion' },
            telefonos_de_contacto: { type: 'string', description: 'Solo criopreservacion' },
            hospital_donde_se_atendera: { type: 'string', description: 'Solo criopreservacion' },
          },
          required: ['service', 'nombre', 'email'],
        },
      },
    },
  },
  {
    name: 'sendEmail',
    effect: 'write',
    run: sendEmail,
    schema: {
      type: 'function',
      function: {
        name: 'sendEmail',
        description:
          'Envía una notificación por correo al equipo INTERNO de Stem Care (no al usuario). REQUIERE confirmación humana. Úsala para escalar un caso relevante al equipo.',
        parameters: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            message: { type: 'string' },
          },
          required: ['subject', 'message'],
        },
      },
    },
  },
];

export const TOOL_SCHEMAS = TOOLS.map((t) => t.schema);

export function toolEffect(name) {
  return TOOLS.find((t) => t.name === name)?.effect ?? 'read';
}

export async function executeTool(name, args, ctx = {}) {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) return `Unknown tool: ${name}`;
  try {
    return await tool.run(args ?? {}, ctx);
  } catch (err) {
    return `Tool error (${name}): ${err.message}`;
  }
}

// Human-readable one-liner for an approval card / tool-result message.
export function summarizeAction(name, args) {
  if (name === 'createLead') {
    const full = [args.nombre, args.apellidos].filter(Boolean).join(' ');
    return `Crear lead (${args.service}) para ${full} <${args.email}>`;
  }
  if (name === 'sendEmail') return `Enviar correo interno al equipo: "${args.subject}"`;
  return `${name}(${JSON.stringify(args)})`;
}
