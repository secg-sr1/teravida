// Server-only Supabase client for the agent runtime + knowledge layer.
//
// Uses the service_role key, which BYPASSES Row Level Security. This must
// NEVER be imported into frontend (src/) code or exposed via a VITE_* env var.
// It is only for Vercel serverless functions (api/) and local scripts.
//
// Supabase is OPTIONAL: when it is unconfigured or unreachable the agent runs in
// a degraded mode (no memory, no approvals, static knowledge) rather than
// failing the request. See lib/agent/memory.mjs and lib/agent/tools.mjs.

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when both env vars are present. Does NOT mean the project is reachable. */
export const supabaseConfigured = Boolean(url && serviceKey);

if (!supabaseConfigured) {
  console.warn(
    '[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — the agent ' +
      'will run without memory, approvals, or vector search.'
  );
}

export const supabase = createClient(url ?? '', serviceKey ?? '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

// A deleted or paused project fails as a thrown TypeError ("fetch failed"), not
// as a returned { error }, so every call site needs both paths covered.
export async function trySupabase(label, fn, fallback) {
  if (!supabaseConfigured) return fallback;
  try {
    const { data, error } = await fn();
    if (error) {
      console.error(`[supabase] ${label}: ${error.message}`);
      return fallback;
    }
    return data ?? fallback;
  } catch (err) {
    console.error(`[supabase] ${label} unreachable: ${err.message}`);
    return fallback;
  }
}
