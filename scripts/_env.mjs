// Loads local env for scripts. MUST be imported FIRST — before any module that
// reads process.env at import time (e.g. the supabase/openai clients). ES module
// imports evaluate in source order, so importing this first guarantees env is
// populated before the clients initialize.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
