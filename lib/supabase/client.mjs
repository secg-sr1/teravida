// Server-only Supabase client for the agent runtime + knowledge layer.
//
// Uses the service_role key, which BYPASSES Row Level Security. This must
// NEVER be imported into frontend (src/) code or exposed via a VITE_* env var.
// It is only for Vercel serverless functions (api/) and local scripts.

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    '[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — ' +
      'agent DB calls will fail. Set them in Vercel env and .env.local.'
  );
}

export const supabase = createClient(url ?? '', serviceKey ?? '', {
  auth: { persistSession: false, autoRefreshToken: false },
});
