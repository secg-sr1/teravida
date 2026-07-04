// Eval runner for the concierge agent.
//
//   npm run eval            # run all cases
//   npm run eval -- price   # run only cases whose id includes "price"
//
// Each case runs through the real agent (RAG + guardrails, no DB writes) and is
// scored with deterministic checks plus an LLM judge for semantic rubrics.
// Exits non-zero if any case fails — usable as a CI gate.

import '../scripts/_env.mjs';
import fs from 'node:fs/promises';
import { runConcierge } from '../lib/agent/run.mjs';
import { openai } from '../lib/openai/client.mjs';

const filter = process.argv[2];

async function loadCases() {
  const raw = await fs.readFile('evals/cases.jsonl', 'utf8');
  const cases = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
  return filter ? cases.filter((c) => c.id.includes(filter)) : cases;
}

async function judge(question, answer, rubric) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a strict QA evaluator. Given a QUESTION, an ANSWER, and a RUBRIC, decide if the answer satisfies the rubric. Respond ONLY with compact JSON: {"pass": true|false, "reason": "<=15 words"}.',
      },
      { role: 'user', content: `QUESTION:\n${question}\n\nANSWER:\n${answer}\n\nRUBRIC:\n${rubric}` },
    ],
  });
  try {
    return JSON.parse(res.choices[0].message.content);
  } catch {
    return { pass: false, reason: 'judge returned non-JSON' };
  }
}

// Returns array of { ok, label } for one case.
async function scoreCase(c, answer, toolsCalled) {
  const results = [];
  const lc = answer.toLowerCase();
  const chk = c.checks || {};

  if (chk.expectTool) {
    results.push({
      ok: toolsCalled.includes(chk.expectTool),
      label: `called ${chk.expectTool}`,
    });
  }
  if (chk.mustContainAny) {
    const hit = chk.mustContainAny.some((t) => lc.includes(t.toLowerCase()));
    results.push({ ok: hit, label: `contains any [${chk.mustContainAny.join(', ')}]` });
  }
  if (chk.mustNotContain) {
    // Case-SENSITIVE on the raw answer: "$"/"USD"/"GTQ" are precise currency
    // markers; lowercasing would spuriously match Spanish words (que, quienes…).
    const bad = chk.mustNotContain.find((t) => answer.includes(t));
    results.push({ ok: !bad, label: `avoids forbidden${bad ? ` (found "${bad.trim()}")` : ''}` });
  }
  if (chk.judge) {
    const v = await judge(c.input, answer, chk.judge);
    results.push({ ok: !!v.pass, label: `judge: ${v.reason || (v.pass ? 'ok' : 'fail')}` });
  }
  return results;
}

async function main() {
  const cases = await loadCases();
  console.log(`\nRunning ${cases.length} eval case(s)…\n`);

  let passed = 0;
  const failures = [];

  for (const c of cases) {
    const toolsCalled = [];
    let answer = '';
    try {
      const r = await runConcierge({
        userMessage: c.input,
        language: c.language || 'es',
        sessionId: null, // no DB writes during evals
        onEvent: (e) => e.type === 'tool' && toolsCalled.push(e.name),
      });
      answer = r.text || '';
    } catch (err) {
      answer = `__ERROR__ ${err.message}`;
    }

    const checks = await scoreCase(c, answer, toolsCalled);
    const casePass = checks.every((x) => x.ok);
    if (casePass) passed++;
    else failures.push({ id: c.id, checks: checks.filter((x) => !x.ok), answer });

    console.log(`${casePass ? '✅' : '❌'} ${c.id}`);
    for (const x of checks) console.log(`     ${x.ok ? '·' : '✗'} ${x.label}`);
  }

  console.log(`\n${passed}/${cases.length} passed.`);
  if (failures.length) {
    console.log('\n--- FAILURES ---');
    for (const f of failures) {
      console.log(`\n[${f.id}]`);
      f.checks.forEach((x) => console.log(`  ✗ ${x.label}`));
      console.log(`  answer: ${f.answer.slice(0, 240)}${f.answer.length > 240 ? '…' : ''}`);
    }
  }
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error('eval crashed:', e);
  process.exit(1);
});
