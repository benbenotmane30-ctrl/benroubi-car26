import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { sendEmail } from '../services/brevo.service.js';
import { bookingAdminTemplate } from '../templates/bookingAdmin.template.js';
import { bookingClientTemplate } from '../templates/bookingClient.template.js';
import { isValidEmail, safeFilename, getExtension, asTrimmedString } from '../utils/validation.utils.js';
import type { EmailAttachment } from '../types/index.js';

const MAX_TOTAL_ATTACHMENT_KB = 9500; // Brevo limite ~10 Mo par email

/**
 * POST /api/bookings — PUBLIC
 * Multipart : champs texte + permis_recto / permis_verso (fichiers, optionnels)
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  const b = req.body ?? {};
  const vehicle = asTrimmedString(b.vehicle);
  const prenom  = asTrimmedString(b.prenom);
  const nom     = asTrimmedString(b.nom);
  const email   = asTrimmedString(b.email);
  const tel     = asTrimmedString(b.tel);
  const debut   = asTrimmedString(b.debut);
  const fin     = asTrimmedString(b.fin);
  const saison  = asTrimmedString(b.saison);
  const total   = asTrimmedString(b.total);
  const jours   = asTrimmedString(b.jours);
  const lieu        = asTrimmedString(b.lieu);
  const lieuRetour  = asTrimmedString(b.lieu_retour);
  const notes       = asTrimmedString(b.notes);

  // Validation
  if (!prenom || !nom) {
    res.status(422).json({ success: false, message: 'Prénom et nom requis.' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(422).json({ success: false, message: 'E-mail invalide.' });
    return;
  }
  if (!tel)     { res.status(422).json({ success: false, message: 'Téléphone requis.' });     return; }
  if (!vehicle) { res.status(422).json({ success: false, message: 'Véhicule non spécifié.' }); return; }
  if (!debut || !fin) {
    res.status(422).json({ success: false, message: 'Dates requises.' });
    return;
  }

  try {
    // ─── Préparer les pièces jointes ───────────────────
    const files = (req.files ?? {}) as Record<string, Express.Multer.File[] | undefined>;
    const attachments: EmailAttachment[] = [];

    const addAttachment = (file: Express.Multer.File | undefined, baseName: string): void => {
      if (!file) return;
      const ext = getExtension(file.originalname, 'jpg');
      attachments.push({
        name: `${safeFilename(baseName)}_${safeFilename(prenom)}_${safeFilename(nom)}.${ext}`,
        contentBase64: file.buffer.toString('base64'),
      });
    };
    addAttachment(files.permis_recto?.[0], 'permis_recto');
    addAttachment(files.permis_verso?.[0], 'permis_verso');
    addAttachment(files.permis?.[0],       'permis'); // back-compat

    // Logging diagnostic + protection taille
    const totalKB = Math.round(attachments.reduce((s, a) => s + a.contentBase64.length, 0) / 1024);
    console.log(`📎 Réservation ${prenom} ${nom} — ${attachments.length} pièce(s) jointe(s), ${totalKB} KB base64`);
    let tooLarge = false;
    if (totalKB > MAX_TOTAL_ATTACHMENT_KB) {
      console.warn(`⚠️  Pièces jointes trop volumineuses (${totalKB} KB) — envoi sans pièces jointes`);
      attachments.length = 0;
      tooLarge = true;
    }

    // ─── Email admin (avec pièces jointes si possible) ─
    const adminParams = { vehicle, prenom, nom, email, tel, debut, fin, saison, total, jours, lieu, lieuRetour, notes };
    try {
      await sendEmail({
        to: env.DEST_EMAIL,
        replyTo: email,
        subject: `🚗 Réservation — ${vehicle} — ${prenom} ${nom}`,
        html: bookingAdminTemplate(adminParams),
        attachments,
      });
    } catch (mailErr) {
      const e = mailErr as Error;
      console.error('❌ 1er envoi échoué:', e.message);
      // Fallback : retenter sans pièces jointes (Brevo a peut-être refusé pour cause de taille)
      if (attachments.length > 0) {
        console.log('🔄 Retry sans pièces jointes...');
        await sendEmail({
          to: env.DEST_EMAIL,
          replyTo: email,
          subject: `🚗 Réservation — ${vehicle} — ${prenom} ${nom} (⚠️ permis non envoyé)`,
          html: bookingAdminTemplate({
            ...adminParams,
            notes: (notes || '') + '\n\n⚠️ Les photos du permis n\'ont pas pu être envoyées. Demander au client de les renvoyer par WhatsApp.',
          }),
        });
      } else {
        throw mailErr;
      }
    }

    // ─── Email confirmation client (non bloquant) ──────
    try {
      await sendEmail({
        to: email,
        subject: `✅ Demande reçue — ${vehicle} — Benroubi Car`,
        html: bookingClientTemplate({ vehicle, prenom, debut, fin, total }),
      });
    } catch (e) {
      console.warn('⚠️  Confirmation client échouée :', (e as Error).message);
    }

    console.log(`✅ Réservation — ${vehicle} — ${prenom} ${nom} — ${email}${tooLarge ? ' (pièces jointes ignorées)' : ''}`);
    res.json({ success: true, message: 'Votre demande a bien été transmise. Vous recevrez une réponse sous 2h.' });

  } catch (err) {
    const e = err as Error;
    console.error('❌ Erreur /api/bookings :', e.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur. Veuillez réessayer ou nous contacter par WhatsApp.',
    });
  }
};
