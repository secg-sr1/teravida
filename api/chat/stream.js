// /api/chat/stream.js
export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { messages, language } = await req.json();
    const system =
      language === 'es'
        ? 'Eres un asistente virtual de Stem Care. Responde en español con precisión y claridad. Responde SIEMPRE en Markdown claro con títulos y listas cuando ayude. Evita respuestas que no tengan relación a células madre, terapia celular y pruebas genéticas'
        : 'You are a virtual assistant for Stem Care. Answer clearly and accurately in English.';

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        stream: true,
        messages: [{ role: 'system', content: system }, ...(messages || []).slice(-5)],
      }),
    });

    const reader = upstream.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
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
              /* ignore parse errors */
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new Response('Error contacting assistant.', { status: 500 });
  }
}
