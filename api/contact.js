// api/contact.js  (CommonJS, Vercel Node.js runtime)
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const TO = process.env.CONTACT_TO || 'contacto@stem-care.com';

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(new Error('Invalid JSON body: ' + e.message)); }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    const { nombre, apellidos, email, telefono, telefonos_de_contacto, mensaje, origen } =
      await readJson(req);

    const missing = [];
    if (!nombre?.trim()) missing.push('nombre');
    if (!email?.trim())  missing.push('email');
    if (missing.length) {
      return res.status(400).json({ ok: false, error: `Faltan campos: ${missing.join(', ')}` });
    }

    const subject = `Nuevo contacto${origen ? ` (${origen})` : ''}: ${nombre} ${apellidos || ''}`.trim();
    const text = [
      `Nombre: ${[nombre, apellidos].filter(Boolean).join(' ')}`,
      `Email: ${email}`,
      `Teléfono: ${telefono || '-'}`,
      `Otros teléfonos: ${telefonos_de_contacto || '-'}`,
      `Origen: ${origen || '-'}`,
      '------',
      (mensaje || '-'),
    ].join('\n');

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111;">
        <h2 style="margin:0 0 12px;">Nuevo contacto ${origen ? `(${origen})` : ''}</h2>
        <p><b>Nombre:</b> ${[nombre, apellidos].filter(Boolean).join(' ')}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Teléfono:</b> ${telefono || '-'}</p>
        <p><b>Otros teléfonos:</b> ${telefonos_de_contacto || '-'}</p>
        ${origen ? `<p><b>Origen:</b> ${origen}</p>` : ''}
        <hr style="border:none;border-top:1px solid #eee;margin:12px 0;">
        <p style="white-space:pre-wrap">${(mensaje || '-').toString().replace(/</g, '&lt;')}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Stem Care <notificaciones@teravida.org>',
      to: TO,
      subject,
      text,
      html,
      reply_to: email,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ ok: false, error: error.message });
    }
    return res.status(200).json({ ok: true, id: data?.id });
  } catch (err) {
    console.error('contact crash:', err);
    return res.status(500).json({ ok: false, error: err.message || 'Send failed' });
  }
};
