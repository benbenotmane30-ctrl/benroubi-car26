/**
 * Alerts Service — Détecte les échéances proches (< 7 jours) et envoie
 * un email récap quotidien à tous les Admin actifs.
 *
 * Stratégie anti-doublon : chaque assurance / visite a un champ alertSentAt.
 * Une fois alertée, on le set à NOW pour ne plus la re-notifier (jusqu'au prochain renouvellement).
 */

import { prisma } from './prisma.service.js';
import { sendEmail, isBrevoConfigured } from './brevo.service.js';
import { sendWhatsApp } from './whatsapp.service.js';
import { logAction } from './audit.service.js';
import { buildAlertEmail } from '../templates/alertExpirations.template.js';
import { buildWhatsAppAlert } from '../templates/alertExpirationsWhatsApp.template.js';

const ALERT_THRESHOLD_DAYS = 7;

function daysBetween(future: Date, ref: Date = new Date()): number {
  const a = new Date(future); a.setHours(0, 0, 0, 0);
  const b = new Date(ref);    b.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export interface AlertRunResult {
  insurancesFound: number;
  visitesFound:    number;
  recipientCount:  number;
  emailsSent:      number;
  whatsappSent:    number;
  errors:          string[];
}

/**
 * Lance un cycle d'alerte. Idempotent grâce à alertSentAt.
 */
export async function runDailyAlerts(): Promise<AlertRunResult> {
  const result: AlertRunResult = {
    insurancesFound: 0,
    visitesFound:    0,
    recipientCount:  0,
    emailsSent:      0,
    whatsappSent:    0,
    errors:          [],
  };

  // Fenêtre : aujourd'hui (minuit) → +7 jours fin de journée
  const now = new Date();
  const endOfWindow = new Date(now);
  endOfWindow.setDate(endOfWindow.getDate() + ALERT_THRESHOLD_DAYS);
  endOfWindow.setHours(23, 59, 59, 999);

  // 1. Récup des échéances proches, pas encore alertées
  const expiringInsurances = await prisma.insurance.findMany({
    where: {
      dateFin:     { lte: endOfWindow },
      alertSentAt: null,
    },
    orderBy: { dateFin: 'asc' },
  });
  const expiringVisites = await prisma.visiteTechnique.findMany({
    where: {
      dateExpiration: { lte: endOfWindow },
      alertSentAt:    null,
    },
    orderBy: { dateExpiration: 'asc' },
  });

  result.insurancesFound = expiringInsurances.length;
  result.visitesFound    = expiringVisites.length;

  if (expiringInsurances.length === 0 && expiringVisites.length === 0) {
    console.log(`🔕 Alertes : aucune échéance proche à signaler.`);
    return result;
  }

  // 2. Récup des destinataires (Admin actifs avec email)
  const recipients = await prisma.adminUser.findMany({
    where:  { active: true, email: { not: '' } },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, whatsappApiKey: true },
  });
  result.recipientCount = recipients.length;

  if (recipients.length === 0) {
    console.warn(`⚠️  Aucun destinataire actif pour les alertes.`);
    return result;
  }
  if (!isBrevoConfigured()) {
    result.errors.push('Brevo non configuré');
    console.error(`❌ Alertes : Brevo non configuré, abandon.`);
    return result;
  }

  // 3. Préparation du payload de l'email (commun à tous les destinataires)
  const insurancesPayload = expiringInsurances.map(i => ({
    matricule: i.matricule,
    marque:    i.marque,
    modele:    i.modele,
    compagnie: i.compagnie,
    dateFin:   i.dateFin,
    daysLeft:  daysBetween(i.dateFin),
  }));
  const visitesPayload = expiringVisites.map(v => ({
    matricule:      v.matricule,
    marque:         v.marque,
    modele:         v.modele,
    centre:         v.centre,
    dateExpiration: v.dateExpiration,
    daysLeft:       daysBetween(v.dateExpiration),
  }));

  // 4. Envoi à chaque destinataire — email + WhatsApp (si configuré)
  for (const rec of recipients) {
    const recipientName = `${rec.firstName} ${rec.lastName}`;

    // Email
    try {
      const { subject, html } = buildAlertEmail({
        recipientName,
        insurances: insurancesPayload,
        visites:    visitesPayload,
      });
      await sendEmail({ to: rec.email, subject, html });
      result.emailsSent += 1;
      console.log(`📧 Alerte email envoyée à ${rec.email}`);
    } catch (err) {
      const msg = `Email ${rec.email} : ${(err as Error).message}`;
      result.errors.push(msg);
      console.error(`❌ Échec email ${msg}`);
    }

    // WhatsApp (seulement si phone + apiKey configurés)
    if (rec.phone && rec.whatsappApiKey) {
      try {
        const text = buildWhatsAppAlert({
          recipientName,
          insurances: insurancesPayload,
          visites:    visitesPayload,
        });
        await sendWhatsApp(rec.phone, rec.whatsappApiKey, text);
        result.whatsappSent += 1;
        console.log(`💬 Alerte WhatsApp envoyée à ${rec.phone}`);
      } catch (err) {
        const msg = `WhatsApp ${rec.phone} : ${(err as Error).message}`;
        result.errors.push(msg);
        console.error(`❌ Échec WhatsApp ${msg}`);
      }
    }
  }

  // 5. Marquer les échéances comme alertées (si au moins un canal a réussi)
  if (result.emailsSent > 0 || result.whatsappSent > 0) {
    const nowTs = new Date();
    if (expiringInsurances.length > 0) {
      await prisma.insurance.updateMany({
        where: { id: { in: expiringInsurances.map(i => i.id) } },
        data:  { alertSentAt: nowTs },
      });
    }
    if (expiringVisites.length > 0) {
      await prisma.visiteTechnique.updateMany({
        where: { id: { in: expiringVisites.map(v => v.id) } },
        data:  { alertSentAt: nowTs },
      });
    }
    void logAction({
      action: 'alert.sent',
      details: {
        insurancesFound: result.insurancesFound,
        visitesFound:    result.visitesFound,
        recipientCount:  result.recipientCount,
        emailsSent:      result.emailsSent,
        whatsappSent:    result.whatsappSent,
        errors:          result.errors.length,
      },
    });
  }

  return result;
}

/**
 * RESET de toutes les alertSentAt — utile pour la démo (re-déclencher les alertes).
 */
export async function resetAllAlertFlags(): Promise<{ insurances: number; visites: number }> {
  const r1 = await prisma.insurance.updateMany({ data: { alertSentAt: null } });
  const r2 = await prisma.visiteTechnique.updateMany({ data: { alertSentAt: null } });
  return { insurances: r1.count, visites: r2.count };
}
