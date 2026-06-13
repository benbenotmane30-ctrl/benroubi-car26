import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { sendEmail } from '../services/brevo.service.js';
import { contactTemplate } from '../templates/contact.template.js';
import { isValidEmail, asTrimmedString } from '../utils/validation.utils.js';

/**
 * POST /api/contact — PUBLIC
 * Body : { nom, email, sujet, message }
 */
export const createContact = async (req: Request, res: Response): Promise<void> => {
  const nom     = asTrimmedString(req.body?.nom);
  const email   = asTrimmedString(req.body?.email);
  const sujet   = asTrimmedString(req.body?.sujet);
  const message = asTrimmedString(req.body?.message);

  if (!isValidEmail(email)) {
    res.status(422).json({ success: false, message: 'E-mail invalide.' });
    return;
  }
  if (!message) {
    res.status(422).json({ success: false, message: 'Message requis.' });
    return;
  }

  try {
    await sendEmail({
      to: env.DEST_EMAIL,
      replyTo: email,
      subject: `✉️ Contact — ${sujet || 'Message depuis le site'} — ${nom || email}`,
      html: contactTemplate({ nom: nom || 'Anonyme', email, sujet, message }),
    });
    console.log(`✅ Contact — ${nom} — ${email}`);
    res.json({ success: true, message: 'Message envoyé ! Nous vous répondrons dans les plus brefs délais.' });
  } catch (err) {
    const e = err as Error;
    console.error('❌ Erreur /api/contact :', e.message);
    res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer.' });
  }
};
