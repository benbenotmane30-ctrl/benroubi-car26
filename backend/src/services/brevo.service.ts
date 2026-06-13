/**
 * Service Brevo — Envoi d'emails transactionnels via leur API HTTPS.
 * Documentation officielle : https://developers.brevo.com/reference/sendtransacemail
 *
 * Pourquoi HTTPS et pas SMTP ?
 * Render free-tier bloque les ports SMTP sortants (25, 465, 587).
 * Brevo expose la même fonctionnalité via une API REST (port 443) — jamais bloqué.
 */

import { env } from '../config/env.js';
import type { SendEmailOptions } from '../types/index.js';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Erreur enrichie avec les détails de la réponse Brevo (pour le debug).
 */
export class BrevoError extends Error {
  status: number;
  brevoBody: string;
  constructor(message: string, status: number, brevoBody: string) {
    super(message);
    this.name = 'BrevoError';
    this.status = status;
    this.brevoBody = brevoBody;
  }
}

export function isBrevoConfigured(): boolean {
  return !!(env.BREVO_API_KEY && env.SENDER_EMAIL);
}

export async function sendEmail(opts: SendEmailOptions): Promise<unknown> {
  if (!env.BREVO_API_KEY) throw new Error('BREVO_API_KEY manquant');
  if (!env.SENDER_EMAIL)  throw new Error('SENDER_EMAIL manquant');

  const body: Record<string, unknown> = {
    sender: { name: env.SENDER_NAME, email: env.SENDER_EMAIL },
    to:     [{ email: opts.to }],
    subject: opts.subject,
    htmlContent: opts.html,
  };
  if (opts.replyTo) body.replyTo = { email: opts.replyTo };
  if (opts.attachments && opts.attachments.length > 0) {
    body.attachment = opts.attachments.map(a => ({ name: a.name, content: a.contentBase64 }));
  }

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept':       'application/json',
      'content-type': 'application/json',
      'api-key':      env.BREVO_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new BrevoError(
      `Brevo HTTP ${res.status}: ${errText.slice(0, 300)}`,
      res.status,
      errText,
    );
  }
  return res.json();
}

export function logBrevoConfig(): void {
  console.log('📧 Brevo HTTP API :');
  console.log('   - API key      :', env.BREVO_API_KEY ? `OK (longueur ${env.BREVO_API_KEY.length})` : '❌ MANQUANT');
  console.log('   - Sender email :', env.SENDER_EMAIL  || '❌ MANQUANT');
  console.log('   - Dest email   :', env.DEST_EMAIL    || '❌ MANQUANT');
}
