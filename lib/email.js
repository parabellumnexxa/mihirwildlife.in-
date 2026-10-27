import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
const OWNER_EMAIL = process.env.OWNER_EMAIL;

export async function sendOwnerEmail({ subject, html }) {
  if (!resend || !OWNER_EMAIL) {
    console.warn('Resend API key or OWNER_EMAIL not configured; skipping email dispatch.');
    return;
  }
  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: OWNER_EMAIL,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
  }
}
