// Server-only email helper (Resend). Mirrors api/contact.js but reusable by
// agent tools. Sends ONLY to the internal Stem Care inbox — the agent cannot
// email arbitrary recipients (abuse/spam boundary).

import { Resend } from 'resend';

export async function sendTeamEmail({ subject, text, html }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const to = process.env.CONTACT_TO || 'contacto@stem-care.com';

  const { data, error } = await resend.emails.send({
    from: 'Stem Care <notificaciones@teravida.org>',
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });

  if (error) throw new Error(error.message || 'Resend send failed');
  return { id: data?.id, to };
}
