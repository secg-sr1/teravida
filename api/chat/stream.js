// /api/chat/stream.js
import { SYSTEM_ES, EDU_CHIPS, pickCta } from './policy.es.mjs';
import { SYSTEM_EN, EDU_CHIPS_EN, pickCtaEn } from './policy.en.mjs';
import { isEveryNth, chipsLine } from './helpers.mjs';

export default async function handler(req, res) {
  // CORS preflight (optional)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  try {
    const { messages = [], language = 'es', context = '' } = req.body;

    // 1) Gate CTA: solo cada 3er turno del usuario (3, 6, 9, …)
    const userTurns = messages.filter((m) => m.role === 'user').length;
    const SHOW_CTA = isEveryNth(3, userTurns);

    // CTA rotativa (evita repetición). Índice basado en cuántas veces ha tocado CTA.
    // Ej: userTurns = 3 -> idx=0; 6 -> idx=1; 9 -> idx=2; …
    const ctaIdx = SHOW_CTA ? Math.floor(userTurns / 3) - 1 : 0;
    const CTA_LINE = SHOW_CTA 
      ? (language === 'es' ? pickCta(ctaIdx) : pickCtaEn(ctaIdx))
      : '';

    // 2) Chips educativos siempre presentes
    // const QUICK_OPTIONS_STRING = chipsLine(language === 'es' ? EDU_CHIPS : EDU_CHIPS_EN);

    // 3) Datos base (seguros, sin precios)
    const baseFacts = language === 'es' 
      ? `
- Stem Care: banco privado de células madre de cordón umbilical en Guatemala (operando desde 2006).
- Procesamiento en menos de 24 horas; almacenamiento en 5 críoviales; fase de vapor de nitrógeno.
- Equipo con experiencia en recolección y trasplantes desde 2008.
- Autorizaciones MSPAS/DRACES y Colegio de Químicos Farmacéuticos; protocolos alineados a FDA/CBER.
- Cobertura 24/7 para recolección en Guatemala y El Salvador.
- Enfoque en educación del paciente y pruebas genéticas (myNewborn, myPrenatal, myHealthScore).
`.trim()
      : `
- Stem Care: private umbilical cord blood stem cell bank in Guatemala (operating since 2006).
- Processing in less than 24 hours; storage in 5 cryovials; nitrogen vapor phase.
- Team with experience in collection and transplants since 2008.
- Authorizations from MSPAS/DRACES and College of Pharmacists; protocols aligned with FDA/CBER.
- 24/7 coverage for collection in Guatemala and El Salvador.
- Focus on patient education and genetic testing (myNewborn, myPrenatal, myHealthScore).
`.trim();

    // 4) System policy - Use Spanish or English based on language parameter
    const system =
      language === 'es'
        ? SYSTEM_ES({
            showCta: SHOW_CTA,
            // chipsLine: QUICK_OPTIONS_STRING,
            baseFacts,
            ctaLine: CTA_LINE,
          })
        : SYSTEM_EN({
            showCta: SHOW_CTA,
            // chipsLine: QUICK_OPTIONS_STRING,
            baseFacts,
            ctaLine: CTA_LINE,
          });

    // 5) Mensajes al modelo: system + bandera SHOW_CTA + context (si hay) + últimos turnos
    const sysMessages = [
      { role: 'system', content: system },
      { role: 'system', content: `SHOW_CTA=${SHOW_CTA}` },
    ];

    if (typeof context === 'string' && context.trim()) {
      sysMessages.push({
        role: 'system',
        content:
          `Contexto de referencia (usa solo lo relevante; omite precios si existieran):\n` +
          context.trim().slice(0, 7000),
      });
    }

    const body = {
      model: 'gpt-4o-mini',
      stream: true,
      messages: [...sysMessages, ...messages.slice(-12)],
    };

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '');
      throw new Error(`Upstream error ${upstream.status}: ${text}`);
    }

    // 6) Stream response to client

    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Model', 'gpt-4o-mini');
    res.status(200);

    // Pipe the stream to the response
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          const s = line.trim();
          if (!s || !s.startsWith('data:')) continue;
          const data = s.slice(5).trim();
          if (data === '[DONE]') {
            res.end();
            return;
          }
          try {
            const json = JSON.parse(data);
            const token = json.choices?.[0]?.delta?.content || '';
            if (token) {
              res.write(token);
            }
          } catch {
            // ignore partial JSON
          }
        }
      }
      res.end();
    } catch (streamErr) {
      console.error('Stream error:', streamErr);
      res.end();
    }
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({
      error: 'Error contacting assistant.',
      detail: err?.message || String(err),
    });
  }
}

// Helpers locales
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
