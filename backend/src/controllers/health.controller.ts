import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { sendEmail } from '../services/brevo.service.js';

export const root = (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    service: 'Benroubi Car API',
    version: '3.0.0',
    endpoints: [
      'GET  /api/ping',
      'GET  /api/test-mail',
      'POST /api/auth/login',
      'GET  /api/auth/verify',
      'GET  /api/cars',
      'PUT  /api/admin/cars',
      'POST /api/bookings',
      'POST /api/contact',
    ],
  });
};

export const ping = (_req: Request, res: Response): void => {
  res.json({ ok: true, ts: Date.now() });
};

/**
 * Route de diagnostic — envoie un email de test au DEST_EMAIL.
 * À supprimer ou protéger en production.
 */
export const testMail = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await sendEmail({
      to: env.DEST_EMAIL,
      subject: '🧪 Test Benroubi Car API (via Brevo)',
      html: '<p>Si vous lisez ceci, <strong>Brevo fonctionne</strong> !</p>',
    });
    res.json({ success: true, message: `E-mail envoyé à ${env.DEST_EMAIL}`, result });
  } catch (err) {
    const e = err as Error & { status?: number; brevoBody?: string };
    res.status(500).json({
      success: false,
      error: { message: e.message, status: e.status, brevoBody: e.brevoBody },
      env: {
        brevo_api_key_present: !!env.BREVO_API_KEY,
        brevo_api_key_length:  env.BREVO_API_KEY?.length ?? 0,
        sender_email:          env.SENDER_EMAIL,
        dest_email:            env.DEST_EMAIL,
      },
    });
  }
};
