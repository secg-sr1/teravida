// /api/chat/stream.js
export const config = { runtime: 'edge' };

import { SYSTEM_ES, EDU_CHIPS, pickCta } from './policy.es.mjs';
import { isEveryNth, chipsLine } from './helpers.mjs';

export default async function handler(req) {
  // CORS preflight (opcional)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    const { messages = [], language = 'es', context = '' } = await req.json();

    // 1) Gate CTA: solo cada 3er turno del usuario (3, 6, 9, …)
    const userTurns = messages.filter((m) => m.role === 'user').length;
    const SHOW_CTA = isEveryNth(3, userTurns);

    // CTA rotativa (evita repetición). Índice basado en cuántas veces ha tocado CTA.
    // Ej: userTurns = 3 -> idx=0; 6 -> idx=1; 9 -> idx=2; …
    const ctaIdx = SHOW_CTA ? Math.floor(userTurns / 3) - 1 : 0;
    const CTA_LINE = SHOW_CTA ? pickCta(ctaIdx) : '';

    // 2) Chips educativos siempre presentes
    const QUICK_OPTIONS_STRING = chipsLine(EDU_CHIPS);

    // 3) Datos base (seguros, sin precios)
    const baseFacts = `
- Stem Care: banco privado de células madre de cordón umbilical en Guatemala (operando desde 2006).
- Procesamiento en menos de 24 horas; almacenamiento en 5 críoviales; fase de vapor de nitrógeno.
- Equipo con experiencia en recolección y trasplantes desde 2008.
- Autorizaciones MSPAS/DRACES y Colegio de Químicos Farmacéuticos; protocolos alineados a FDA/CBER.
- Cobertura 24/7 para recolección en Guatemala y El Salvador.
- Enfoque en educación del paciente y pruebas genéticas (myNewborn, myPrenatal, myHealthScore).
`.trim();

    // 4) System policy (ES por defecto). Si usan EN, lo mantenemos mínimo.
    const system =
      language === 'es'
        ? SYSTEM_ES({
            showCta: SHOW_CTA,
            chipsLine: QUICK_OPTIONS_STRING,
            baseFacts,
            ctaLine: CTA_LINE,
          })
        : `You are Stem Care’s assistant. Default to Spanish unless explicitly asked for English.
Never provide pricing. Do not diagnose. Start with <!--intent=...-->.
Facts:
${baseFacts}`;


// `You are Stem Care’s assistant. Default to Spanish unless explicitly asked for English.
// Never provide pricing. Do not diagnose. Start with <!--intent=...-->.
// End with "**Opciones rápidas:** ${QUICK_OPTIONS_STRING}".
// ${SHOW_CTA ? `Add this exact CTA sentence before the quick options: "${CTA_LINE}"` : `Do not include any CTA sentence this turn.`}
// Facts:
// ${baseFacts}`;

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

    // 6) Pipe del stream
    const reader = upstream.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const s = line.trim();
              if (!s || !s.startsWith('data:')) continue;
              const data = s.slice(5).trim();
              if (data === '[DONE]') {
                controller.close();
                return;
              }
              try {
                const json = JSON.parse(data);
                const token = json.choices?.[0]?.delta?.content || '';
                if (token) controller.enqueue(encoder.encode(token));
              } catch {
                /* ignore partials */
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Access-Control-Allow-Origin': '*',
        'X-Model': 'gpt-4o-mini',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Error contacting assistant.',
        detail: err?.message || String(err),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
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
