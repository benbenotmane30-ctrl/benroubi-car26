/**
 * Template HTML — Email récap quotidien des échéances proches (< 7 jours).
 * Une seule fonction qui produit le HTML pour 1 destinataire avec toutes les échéances.
 */

interface ExpiringInsurance {
  matricule:  string;
  marque:     string;
  modele:     string;
  compagnie:  string;
  dateFin:    Date;
  daysLeft:   number;
}

interface ExpiringVisite {
  matricule:      string;
  marque:         string;
  modele:         string;
  centre:         string;
  dateExpiration: Date;
  daysLeft:       number;
}

export interface AlertEmailParams {
  recipientName: string;
  insurances:    ExpiringInsurance[];
  visites:       ExpiringVisite[];
}

const fmtDate = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

function daysLabel(n: number): string {
  if (n < 0)  return `⛔ Expirée depuis ${Math.abs(n)} j`;
  if (n === 0) return `⚠️ Expire AUJOURD'HUI`;
  if (n === 1) return `⚠️ Expire DEMAIN`;
  return `⏰ Dans ${n} jours`;
}

function daysColor(n: number): string {
  if (n < 0)  return '#b91c1c';
  if (n <= 1) return '#b91c1c';
  if (n <= 3) return '#c2410c';
  return '#a16207';
}

export function buildAlertEmail(params: AlertEmailParams): { subject: string; html: string } {
  const totalCount = params.insurances.length + params.visites.length;
  const subject = `🔔 ${totalCount} échéance${totalCount > 1 ? 's' : ''} dans les 7 prochains jours — Benroubi Car`;

  const insuranceRows = params.insurances.map(ins => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: .75rem; font-family: monospace; font-weight: 700; letter-spacing: .04em; color: #0D0D0D;">${ins.matricule}</td>
      <td style="padding: .75rem;">
        <strong style="color: #0D0D0D;">${ins.marque}</strong><br/>
        <span style="color: #6b7280; font-size: .85rem;">${ins.modele}</span>
      </td>
      <td style="padding: .75rem; color: #374151;">${ins.compagnie}</td>
      <td style="padding: .75rem; color: #374151;">${fmtDate(ins.dateFin)}</td>
      <td style="padding: .75rem; text-align: right;">
        <span style="display: inline-block; padding: .25rem .6rem; border-radius: 10px; background: ${daysColor(ins.daysLeft)}15; color: ${daysColor(ins.daysLeft)}; font-size: .8rem; font-weight: 700;">
          ${daysLabel(ins.daysLeft)}
        </span>
      </td>
    </tr>
  `).join('');

  const visiteRows = params.visites.map(v => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: .75rem; font-family: monospace; font-weight: 700; letter-spacing: .04em; color: #0D0D0D;">${v.matricule}</td>
      <td style="padding: .75rem;">
        <strong style="color: #0D0D0D;">${v.marque}</strong><br/>
        <span style="color: #6b7280; font-size: .85rem;">${v.modele}</span>
      </td>
      <td style="padding: .75rem; color: #374151;">${v.centre}</td>
      <td style="padding: .75rem; color: #374151;">${fmtDate(v.dateExpiration)}</td>
      <td style="padding: .75rem; text-align: right;">
        <span style="display: inline-block; padding: .25rem .6rem; border-radius: 10px; background: ${daysColor(v.daysLeft)}15; color: ${daysColor(v.daysLeft)}; font-size: .8rem; font-weight: 700;">
          ${daysLabel(v.daysLeft)}
        </span>
      </td>
    </tr>
  `).join('');

  const insuranceSection = params.insurances.length === 0 ? '' : `
    <h2 style="font-family: Georgia, serif; font-size: 1.4rem; color: #0D0D0D; margin: 2rem 0 .8rem;">
      🛡️ Assurances (${params.insurances.length})
    </h2>
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08);">
      <thead style="background: #f9fafb;">
        <tr>
          <th style="padding: .75rem; text-align: left; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280;">Matricule</th>
          <th style="padding: .75rem; text-align: left; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280;">Véhicule</th>
          <th style="padding: .75rem; text-align: left; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280;">Compagnie</th>
          <th style="padding: .75rem; text-align: left; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280;">Échéance</th>
          <th style="padding: .75rem; text-align: right; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280;">Statut</th>
        </tr>
      </thead>
      <tbody>${insuranceRows}</tbody>
    </table>
  `;

  const visiteSection = params.visites.length === 0 ? '' : `
    <h2 style="font-family: Georgia, serif; font-size: 1.4rem; color: #0D0D0D; margin: 2rem 0 .8rem;">
      🔧 Visites techniques (${params.visites.length})
    </h2>
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08);">
      <thead style="background: #f9fafb;">
        <tr>
          <th style="padding: .75rem; text-align: left; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280;">Matricule</th>
          <th style="padding: .75rem; text-align: left; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280;">Véhicule</th>
          <th style="padding: .75rem; text-align: left; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280;">Centre</th>
          <th style="padding: .75rem; text-align: left; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280;">Échéance</th>
          <th style="padding: .75rem; text-align: right; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280;">Statut</th>
        </tr>
      </thead>
      <tbody>${visiteRows}</tbody>
    </table>
  `;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${subject}</title></head>
<body style="margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827;">
  <div style="max-width: 720px; margin: 0 auto; padding: 2rem 1.2rem;">

    <!-- Header -->
    <div style="background: #0D0D0D; padding: 2rem 1.5rem; border-radius: 10px 10px 0 0; text-align: center;">
      <div style="font-family: Georgia, serif; font-size: 1.8rem; color: white;">
        Benroubi<span style="color: #C9A96E;"> Car</span>
      </div>
      <div style="color: #C9A96E; font-size: .75rem; letter-spacing: .12em; text-transform: uppercase; margin-top: .4rem;">
        Alerte d'échéance · Administration
      </div>
    </div>

    <!-- Body -->
    <div style="background: white; padding: 1.8rem; border-radius: 0 0 10px 10px;">
      <p style="font-size: 1.05rem; margin: 0 0 .5rem;">Bonjour <strong>${params.recipientName}</strong>,</p>
      <p style="color: #374151; line-height: 1.6;">
        ${totalCount === 1 ? 'Un véhicule a' : `${totalCount} véhicules ont`} une échéance administrative
        qui arrive dans les <strong>7 prochains jours</strong>. Pensez à les renouveler.
      </p>

      ${insuranceSection}
      ${visiteSection}

      <p style="margin-top: 2rem; font-size: .85rem; color: #6b7280; line-height: 1.5;">
        Cette alerte est envoyée automatiquement chaque matin à 8h00.
        Connectez-vous à l'administration pour voir tous les détails et renouveler les contrats.
      </p>

      <div style="text-align: center; margin-top: 1.5rem;">
        <a href="http://localhost:5174" style="display: inline-block; background: #0D0D0D; color: #C9A96E; padding: .8rem 2rem; border-radius: 6px; text-decoration: none; font-weight: 600; letter-spacing: .04em; font-size: .85rem; text-transform: uppercase;">
          Ouvrir l'administration
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 1.5rem; color: #9ca3af; font-size: .75rem;">
      Benroubi Car · Location de voitures · Oujda<br/>
      Cet email est envoyé automatiquement, merci de ne pas y répondre.
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}
