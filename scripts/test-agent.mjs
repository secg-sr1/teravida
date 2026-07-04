// CLI harness for the concierge agent — exercises tool-calling, RAG retrieval,
// guardrails, and session memory end-to-end without needing `vercel dev`.
//
//   npm run agent -- "¿Qué es la criopreservación?"
//   npm run agent -- "How does cord blood collection work?" en

import './_env.mjs';
import { runConcierge } from '../lib/agent/run.mjs';
import { createSession } from '../lib/agent/memory.mjs';

const args = process.argv.slice(2);
const language = args[args.length - 1] === 'en' ? 'en' : 'es';
const question =
  (language === 'en' ? args.slice(0, -1) : args).join(' ') ||
  '¿Qué es la criopreservación de células madre y por qué es importante?';

const sessionId = await createSession(language);
console.log(`\nsession: ${sessionId}`);
console.log(`Q (${language}): ${question}\n`);

const { text, steps } = await runConcierge({
  userMessage: question,
  language,
  sessionId,
  onEvent: (e) => console.log(`  ↳ tool: ${e.name}(${JSON.stringify(e.args)})`),
});

console.log(`\n--- ANSWER (${steps} step${steps > 1 ? 's' : ''}) ---\n${text}\n`);
process.exit(0);
