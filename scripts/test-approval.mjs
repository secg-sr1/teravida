// End-to-end test of the human-approval flow:
//   user asks to be contacted -> agent PROPOSES createLead (no execution)
//   -> we approve -> tool executes -> Directus insert.
//
//   npm run approve                 # propose + approve (inserts a TEST lead)
//   npm run approve -- reject        # propose + reject (no side effect)
//
// ⚠️  The approve path inserts a clearly-marked TEST lead into Directus — delete
//     it from the Directus admin afterwards.

import './_env.mjs';
import { runConcierge } from '../lib/agent/run.mjs';
import { createSession } from '../lib/agent/memory.mjs';
import { listPending, decide } from '../lib/agent/approvals.mjs';

const mode = process.argv[2] === 'reject' ? 'reject' : 'approve';

const sessionId = await createSession('es');
console.log(`session: ${sessionId}  (mode: ${mode})`);

console.log('\n--- User leaves contact info (agent should PROPOSE createLead) ---');
const r = await runConcierge({
  userMessage:
    'Me llamo TEST Claude Borrar, mi correo es test-borrar@example.com y mi teléfono es 55555555. ' +
    'Quiero que me contacten sobre la criopreservación de sangre de cordón umbilical.',
  language: 'es',
  sessionId,
  onEvent: (e) =>
    console.log(`  ↳ ${e.type}: ${e.name || ''}${e.summary ? ' · ' + e.summary : ''}${e.approvalId ? ' (id=' + e.approvalId + ')' : ''}`),
});
console.log('\nAgent said:\n', r.text);

const pending = await listPending(sessionId);
console.log(
  '\nPending approvals:',
  pending.map((p) => ({ id: p.id, summary: p.proposed_action?.summary }))
);

if (!pending.length) {
  console.log('\n⚠️  No proposal created — the agent did not call a write tool this run.');
  process.exit(0);
}

console.log(`\n--- ${mode === 'approve' ? 'Approving' : 'Rejecting'} proposal #${pending[0].id} ---`);
const out = await decide(pending[0].id, mode, 'test-script');
console.log('Decision result:', JSON.stringify(out, null, 2));

if (mode === 'approve') {
  console.log('\n⚠️  A TEST lead was inserted into Directus (collection "criopreservacion"). Delete it in the admin.');
}
process.exit(0);
