// // /api/chat/stream.js
// export const config = { runtime: 'edge' };

// export default async function handler(req) {
//   try {
//     const { messages, language } = await req.json();
//     // const system =
//     //   language === 'es'
//     //     ? 'Eres un asistente virtual de Stem Care. Responde en español con precisión y claridad. Responde SIEMPRE en Markdown claro con títulos y listas cuando ayude. Evita respuestas que no tengan relación a células madre, terapia celular y pruebas genéticas'
//     //     : 'You are a virtual assistant for Stem Care. Answer clearly and accurately in English.';
//     // /api/chat/stream.js  (only the system string)
//     const system =
//     language === 'es'
//       ? STRUCTURE_POLICY_ES
//       : 'You are a virtual assistant for Stem Care. Answer clearly and accurately in English.';


//     const baseFacts = `
//     - Stem Care: primer y único banco privado de células madre de cordón umbilical en Guatemala (operando desde 2006).
//     - Traslados y procesamiento en <24h; almacenamiento en 5 críoviales; fase de vapor de nitrógeno.
//     - Equipo médico multidisciplinario con experiencia en recolección y trasplantes desde 2008.
//     - Laboratorio autorizado por MSPAS/DRACES y Colegio de Químicos Farmacéuticos; protocolos alineados a FDA/CBER.
//     - Disponibilidad 24/7 para recolección en Guatemala y El Salvador.
//     - Enfoque en educación del paciente, medicina regenerativa y pruebas genéticas (p.ej., myNewborn, myPrenatal, myHealthScore).
//     `;

//     const STRUCTURE_POLICY_ES = `
//     Eres un asistente virtual de Stem Care. Responde SIEMPRE en español, con precisión clínica y empatía.
//     Formato: usa Markdown con títulos breves, listas y párrafos cortos.

//     Alcance:
//     - Temas: criopreservación de sangre de cordón umbilical, aplicaciones terapéuticas de células madre, procesos clínicos, pruebas genéticas relacionadas, y datos institucionales de Stem Care.
//     - NO des precios. Si preguntan por costos, explica con amabilidad que esa información se trata en una consulta informativa con el especialista.
//     - NO diagnostiques. Ofrece orientación general basada en evidencia y aclara límites.

//     Confianza:
//     - Cuando ayude, menciona brevemente credenciales verificables (p. ej., inicio 2006, trasplantes desde 2008, autorizaciones locales, protocolos tipo FDA/CBER).
//     - No hagas afirmaciones extraordinarias; usa lenguaje prudente (“la evidencia sugiere…”, “en algunos casos…”).

//     Estructura de cada respuesta:
//     1) Resumen en 1-2 oraciones (qué debe saber el usuario).
//     2) Desarrollo educativo en viñetas o pasos.
//     3) **Próximo paso sugerido**: invita de forma orgánica y sin presión a resolver dudas con un especialista (“consulta informativa, sin compromiso”).
//     4) **Opciones rápidas**: muestra de 3 a 5 chips de navegación entre corchetes, por ejemplo:
//       [Beneficios] [Aplicaciones] [Proceso de recolección] [Pruebas genéticas] [Hablar con especialista]

//     CTA orgánico:
//     - Nunca “exijas” llenar formularios. Pregunta primero si desea conversar con un especialista y, sólo con permiso explícito, solicita el dato mínimo (teléfono o email) para coordinar.

//     Contexto:
//     - Si hay "context" provisto en el payload, úsalo como fuente prioritaria.
//     - Estos son datos base de respaldo:
//     ${baseFacts}
//     `;


//     const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'gpt-4o-mini',
//         stream: true,
//         messages: [{ role: 'system', content: system }, ...(messages || []).slice(-5)],
//       }),
//     });

//     const reader = upstream.body.getReader();
//     const encoder = new TextEncoder();
//     const decoder = new TextDecoder();

//     const stream = new ReadableStream({
//       async start(controller) {
//         let buffer = '';
//         while (true) {
//           const { value, done } = await reader.read();
//           if (done) break;

//           buffer += decoder.decode(value, { stream: true });
//           const lines = buffer.split('\n');
//           buffer = lines.pop() || '';

//           for (const line of lines) {
//             const s = line.trim();
//             if (!s || !s.startsWith('data:')) continue;
//             const data = s.slice(5).trim();
//             if (data === '[DONE]') {
//               controller.close();
//               return;
//             }
//             try {
//               const json = JSON.parse(data);
//               const token = json.choices?.[0]?.delta?.content || '';
//               if (token) controller.enqueue(encoder.encode(token));
//             } catch {
//               /* ignore parse errors */
//             }
//           }
//         }
//         controller.close();
//       },
//     });

//     return new Response(stream, {
//       headers: {
//         'Content-Type': 'text/plain; charset=utf-8',
//         'Cache-Control': 'no-cache',
//       },
//     });
//   } catch {
//     return new Response('Error contacting assistant.', { status: 500 });
//   }
// }




// /api/chat/stream.js
export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Handle CORS preflight (optional; remove if your environment doesn’t need it)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { messages = [], language = 'es', context = '' } = await req.json();

    // --- Domain facts you’re comfortable asserting everywhere (no precios) ---
    const baseFacts = `
- Stem Care: primer y único banco privado de células madre de cordón umbilical en Guatemala (operando desde 2006).
- Traslado y procesamiento en <24h; almacenamiento en 5 críoviales; fase de vapor de nitrógeno.
- Equipo médico multidisciplinario con experiencia en recolección y trasplantes desde 2008.
- Laboratorio autorizado por MSPAS/DRACES y Colegio de Químicos Farmacéuticos; protocolos alineados a FDA/CBER.
- Cobertura 24/7 para recolección en Guatemala y El Salvador.
- Foco en educación del paciente, medicina regenerativa y pruebas genéticas (myNewborn, myPrenatal, myHealthScore).
`.trim();

    // --- Core behavioral policy (Spanish-first, structure, CTA orgánico) ---
    const STRUCTURE_POLICY_ES = `
Eres un asistente virtual de Stem Care. Responde SIEMPRE en español, con precisión clínica y empatía.
Formato: usa Markdown con títulos breves, listas y párrafos cortos.

Alcance:
- Temas: criopreservación de sangre de cordón umbilical, aplicaciones terapéuticas de células madre, procesos clínicos, pruebas genéticas relacionadas y datos institucionales de Stem Care.
- NO des precios. Si preguntan por costos, explica con amabilidad que esa información se trata en una consulta informativa con el especialista.
- NO diagnostiques. Ofrece orientación general basada en evidencia y aclara límites.

Confianza:
- Cuando ayude, menciona brevemente credenciales verificables (p. ej., inicio 2006, trasplantes desde 2008, autorizaciones locales, protocolos tipo FDA/CBER).
- Usa lenguaje prudente (“la evidencia sugiere…”, “en algunos casos…”).

Estructura de cada respuesta:
1) Resumen en 1–2 oraciones (lo esencial).
2) Desarrollo educativo en viñetas o pasos.
3) **Próximo paso sugerido**: invita de forma orgánica y sin presión a resolver dudas con un especialista (“consulta informativa, sin compromiso”).
4) **Opciones rápidas**: cierra con 3–5 chips entre corchetes, por ejemplo:
   [Beneficios] [Aplicaciones] [Proceso de recolección] [Pruebas genéticas] [Hablar con especialista]

CTA orgánico:
- Nunca exijas llenar formularios. Primero pregunta si desea conversar con un especialista y, sólo con permiso explícito, solicita el dato mínimo (teléfono o email) para coordinar.

Contexto:
- Si recibes "context" en el payload, úsalo como fuente prioritaria cuando sea relevante. No cites precios aunque aparezcan en el contexto.

Marcado de intención (no visible para el usuario):
- Escribe en la 1ª línea un comentario HTML con una sola intención entre:
  intent=educar|proceso|aplicaciones|pruebas|hablar_especialista|fuera_de_alcance
- Ejemplo: <!--intent=proceso-->

Datos base de respaldo:
${baseFacts}
`.trim();

    const STRUCTURE_POLICY_EN = `
You are a virtual assistant for Stem Care. Be precise, medically careful, and empathetic. Default to Spanish unless the user explicitly asks for English. Never provide pricing; invite to a no-commitment informative consultation with a specialist instead. Use clear Markdown with headings, bullets, and end with organic quick options like [Beneficios] [Aplicaciones] [Proceso de recolección] [Pruebas genéticas] [Hablar con especialista]. Start each answer with an HTML comment like <!--intent=educar|proceso|aplicaciones|pruebas|hablar_especialista|fuera_de_alcance-->.
`.trim();

    const system = language === 'es' ? STRUCTURE_POLICY_ES : STRUCTURE_POLICY_EN;

    // Build message stack: system policy + optional context (as system) + recent history
    const sysMessages = [{ role: 'system', content: system }];

    if (typeof context === 'string' && context.trim().length > 0) {
      // Trim and cap to avoid excessive tokens
      const ctx = context.trim().slice(0, 7000);
      sysMessages.push({
        role: 'system',
        content:
          `Contexto de referencia (prioridad cuando sea relevante; omite precios si existieran):\n` + ctx,
      });
    }

    const body = {
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        ...sysMessages,
        ...messages.slice(-12), // keep the last turns
      ],
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
                // ignore parse errors for partial lines
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
