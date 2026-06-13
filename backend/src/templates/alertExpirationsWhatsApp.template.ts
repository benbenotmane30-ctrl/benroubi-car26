/**
 * Template TEXTE pour message WhatsApp d'alerte échéances.
 * Format texte simple, emojis pour structure visuelle, court (~1000 chars max recommandé).
 */

interface ExpiringInsurance {
  matricule: string;
  marque:    string;
  modele:    string;
  compagnie: string;
  dateFin:   Date;
  daysLeft:  number;
}

interface ExpiringVisite {
  matricule:      string;
  marque:         string;
  modele:         string;
  centre:         string;
  dateExpiration: Date;
  daysLeft:       number;
}

export interface WhatsAppAlertParams {
  recipientName: string;
  insurances:    ExpiringInsurance[];
  visites:       ExpiringVisite[];
}

const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });

function daysLabel(n: number): string {
  if (n < 0)  return `EXPIRÉE depuis ${Math.abs(n)} j`;
  if (n === 0) return `AUJOURD'HUI !`;
  if (n === 1) return `DEMAIN`;
  return `dans ${n} j`;
}

export function buildWhatsAppAlert(params: WhatsAppAlertParams): string {
  const total = params.insurances.length + params.visites.length;
  const lines: string[] = [];

  lines.push(`*🔔 Benroubi Car — Alerte échéances*`);
  lines.push(``);
  lines.push(`Bonjour *${params.recipientName}*,`);
  lines.push(`${total} échéance${total > 1 ? 's' : ''} dans les 7 prochains jours :`);
  lines.push(``);

  if (params.insurances.length > 0) {
    lines.push(`🛡️ *Assurances (${params.insurances.length})*`);
    params.insurances.forEach(i => {
      lines.push(`• \`${i.matricule}\` ${i.marque} ${i.modele}`);
      lines.push(`  ${i.compagnie} — fin le ${fmt(i.dateFin)} (${daysLabel(i.daysLeft)})`);
    });
    lines.push(``);
  }

  if (params.visites.length > 0) {
    lines.push(`🔧 *Visites techniques (${params.visites.length})*`);
    params.visites.forEach(v => {
      lines.push(`• \`${v.matricule}\` ${v.marque} ${v.modele}`);
      lines.push(`  ${v.centre} — expire le ${fmt(v.dateExpiration)} (${daysLabel(v.daysLeft)})`);
    });
    lines.push(``);
  }

  lines.push(`Pensez à renouveler les contrats.`);
  lines.push(`👉 Admin : http://localhost:5174`);

  return lines.join('\n');
}
