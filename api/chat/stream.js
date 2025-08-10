export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { messages, language } = await req.json();
    const trimmed = Array.isArray(messages) ? messages.slice(-5) : [];

    const system = language === 'es'
      ? 'Eres un asistente virtual de Stem Care. Responde en español con precisión y claridad.'
      : 'You are a virtual assistant for Stem Care. Answer clearly and accurately in English.';

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',     // pick your model
        stream: true,
        messages: [{ role: 'system', content: system }, ...trimmed],
      }),
    });

    // Pipe OpenAI's stream straight through to the browser.
    return new Response(resp.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e) {
    return new Response('Error contacting assistant.', { status: 500 });
  }
}
