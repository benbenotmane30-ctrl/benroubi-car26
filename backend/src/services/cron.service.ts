/**
 * Cron Service — Tâches planifiées du backend.
 *
 * Tâche actuelle : alerte quotidienne 8h pour les échéances < 7 jours.
 */

import cron from 'node-cron';
import { runDailyAlerts } from './alerts.service.js';

const DAILY_8AM = '0 8 * * *';  // À 8h00 chaque jour

let task: ReturnType<typeof cron.schedule> | null = null;

export function startCronJobs(): void {
  if (task) {
    console.warn('⚠️  Cron déjà démarré, skip.');
    return;
  }

  task = cron.schedule(DAILY_8AM, async () => {
    console.log(`⏰ [cron] Lancement du check des échéances...`);
    try {
      const r = await runDailyAlerts();
      console.log(`✅ [cron] Terminé — insurances=${r.insurancesFound} visites=${r.visitesFound} emails=${r.emailsSent}/${r.recipientCount}`);
    } catch (err) {
      console.error(`❌ [cron] Erreur :`, (err as Error).message);
    }
  }, {
    timezone: 'Africa/Casablanca',  // Heure marocaine
  });

  console.log(`⏰ Cron démarré — alertes échéances chaque jour à 8h00 (Africa/Casablanca)`);
}

export function stopCronJobs(): void {
  if (task) {
    task.stop();
    task = null;
    console.log('⏸️  Cron arrêté.');
  }
}
