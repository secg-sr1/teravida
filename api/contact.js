// // api/contact.js  (ESM, works with "type":"module")
// import { Resend } from 'resend';

// export default async function handler(req, res) {
//   if (req.method === 'OPTIONS') return res.status(200).end();
//   if (req.method !== 'POST') {
//     return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
//   }

//   try {
//     // Read raw body (Vercel Node function does not auto-parse JSON)
//     const chunks = [];
//     for await (const chunk of req) chunks.push(chunk);
//     const raw = Buffer.concat(chunks).toString('utf8') || '{}';

//     let body = {};
//     try {
//       body = JSON.parse(raw);
//     } catch {
//       return res.status(400).json({ ok: false, error: 'Invalid JSON' });
//     }

//     // ✅ Destructure from the parsed body (so "nombre" exists)
//     const {
//       nombre = '',
//       apellidos = '',
//       email = '',
//       telefono = '',
//       telefonos_de_contacto = '',
//       mensaje = '',
//       origen = '',
//     } = body;

//     // Basic validation
//     const missing = [];
//     if (!nombre.trim()) missing.push('nombre');
//     if (!email.trim()) missing.push('email');
//     if (missing.length) {
//       return res
//         .status(400)
//         .json({ ok: false, error: `Faltan campos: ${missing.join(', ')}` });
//     }

//     // Send email via Resend
//     const resend = new Resend(process.env.RESEND_API_KEY);
//     const TO = process.env.CONTACT_TO || 'contacto@stem-care.com';

//     const subject = `Nuevo contacto${origen ? ` (${origen})` : ''}: ${nombre} ${apellidos}`.trim();
//     const text = [
//       `Nombre: ${[nombre, apellidos].filter(Boolean).join(' ')}`,
//       `Email: ${email}`,
//       `Teléfono: ${telefono || '-'}`,
//       `Otros teléfonos: ${telefonos_de_contacto || '-'}`,
//       `Origen: ${origen || '-'}`,
//       '------',
//       mensaje || '-',
//     ].join('\n');

//     const html = `
//       <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111">
//         <h2 style="margin:0 0 12px">Nuevo contacto ${origen ? `(${origen})` : ''}</h2>
//         <p><b>Nombre:</b> ${[nombre, apellidos].filter(Boolean).join(' ')}</p>
//         <p><b>Email:</b> ${email}</p>
//         <p><b>Teléfono:</b> ${telefono || '-'}</p>
//         <p><b>Otros teléfonos:</b> ${telefonos_de_contacto || '-'}</p>
//         ${origen ? `<p><b>Origen:</b> ${origen}</p>` : ''}
//         <hr style="border:none;border-top:1px solid #eee;margin:12px 0">
//         <p style="white-space:pre-wrap">${(mensaje || '-')
//           .toString()
//           .replace(/</g, '&lt;')}</p>
//       </div>
//     `;

//     const { data, error } = await resend.emails.send({
//       from: 'Stem Care <notificaciones@teravida.org>',
//       to: TO,
//       subject,
//       text,
//       html,
//       reply_to: email,
//     });

//     if (error) return res.status(502).json({ ok: false, error: error.message });
//     return res.status(200).json({ ok: true, id: data?.id });
//   } catch (err) {
//     console.error('contact crash:', err);
//     return res.status(500).json({ ok: false, error: err.message || 'Send failed' });
//   }
// }


// api/contact.js  (ESM)
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    // Read JSON body (Vercel does not auto-parse here)
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8') || '{}';

    let body = {};
    try {
      body = JSON.parse(raw);
    } catch {
      return res.status(400).json({ ok: false, error: 'Invalid JSON' });
    }

    // Fields coming from any of the three tabs
    const {
      nombre = '',
      apellidos = '',
      email = '',
      telefono = '',
      telefonos_de_contacto = '',
      mensaje = '',
      origen = '',
      // extra (Criopreservación)
      semana_de_embarazo,
      nombre_de_ginecologo,
    } = body;

    // Validate required
    const missing = [];
    if (!nombre.trim()) missing.push('nombre');
    if (!email.trim())  missing.push('email');
    if (missing.length) {
      return res.status(400).json({ ok: false, error: `Faltan campos: ${missing.join(', ')}` });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const TO = process.env.CONTACT_TO || 'contacto@stem-care.com';

    // Build lines only for values that exist
    const lines = [
      ['Origen', origen],
      ['Nombre', [nombre, apellidos].filter(Boolean).join(' ')],
      ['Email', email],
      ['Teléfono', telefono],
      ['Teléfonos de contacto', telefonos_de_contacto],
      ['Semana de embarazo', semana_de_embarazo],
      ['Nombre de Ginecólogo', nombre_de_ginecologo],
    ].filter(([, v]) => v !== undefined && String(v).trim() !== '');

    const subject = `Nuevo contacto${origen ? ` (${origen})` : ''}: ${nombre} ${apellidos}`.trim();
    const text =
      lines.map(([k, v]) => `${k}: ${v}`).join('\n') +
      `\n------\n${mensaje || '-'}`;

    const html =
      `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111">` +
      `<h2 style="margin:0 0 12px">Nuevo contacto${origen ? ` (${origen})` : ''}</h2>` +
      lines
        .map(
          ([k, v]) =>
            `<p><b>${k}:</b> ${String(v).replace(/</g, '&lt;')}</p>`
        )
        .join('') +
      `<hr style="border:none;border-top:1px solid #eee;margin:12px 0">` +
      `<p style="white-space:pre-wrap">${(mensaje || '-')
        .toString()
        .replace(/</g, '&lt;')}</p>` +
      `</div>`;

    const { data, error } = await resend.emails.send({
      from: 'Stem Care <notificaciones@teravida.org>',
      to: TO,
      subject,
      text,
      html,
      reply_to: email, // lets you reply from Gmail straight to the sender
    });

    if (error) return res.status(502).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, id: data?.id });
  } catch (err) {
    console.error('contact crash:', err);
    return res.status(500).json({ ok: false, error: err.message || 'Send failed' });
  }
}
