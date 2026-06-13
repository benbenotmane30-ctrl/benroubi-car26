/**
 * Template HTML de l'email reçu par l'admin (gérant de l'agence)
 * lors d'une nouvelle demande de réservation.
 */

interface Params {
  vehicle: string;
  prenom: string;
  nom: string;
  email: string;
  tel: string;
  debut: string;
  fin: string;
  saison?: string;
  total?: string;
  jours?: string;
  lieu?: string;
  notes?: string;
}

export function bookingAdminTemplate(p: Params): string {
  const tel = (p.tel || '').replace(/\D/g, '');
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">

  <tr><td style="background:#0D0D0D;padding:24px 30px;">
    <h1 style="margin:0;font-size:22px;color:#fff;font-family:Georgia,serif;font-weight:300;">
      Benroubi <span style="color:#C9A96E;">Car</span>
    </h1>
    <p style="margin:5px 0 0;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;">
      Nouvelle demande de réservation
    </p>
  </td></tr>

  <tr><td style="background:#C9A96E;padding:14px 30px;">
    <p style="margin:0;font-size:15px;font-weight:bold;color:#0D0D0D;">🚗 ${p.vehicle}</p>
  </td></tr>

  <tr><td style="padding:30px;">

    <h2 style="margin:0 0 16px;font-size:15px;color:#0D0D0D;border-bottom:2px solid #C9A96E;padding-bottom:8px;">
      👤 Informations du client
    </h2>
    <table width="100%" cellpadding="7" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
      <tr><td style="color:#888;width:130px;">Nom complet</td><td style="font-weight:bold;color:#0D0D0D;">${p.prenom} ${p.nom}</td></tr>
      <tr style="background:#f9f9f9;"><td style="color:#888;">E-mail</td>
        <td><a href="mailto:${p.email}" style="color:#C9A96E;text-decoration:none;">${p.email}</a></td></tr>
      <tr><td style="color:#888;">Téléphone</td>
        <td><a href="tel:${p.tel}" style="color:#C9A96E;text-decoration:none;">${p.tel}</a></td></tr>
    </table>

    <h2 style="margin:25px 0 16px;font-size:15px;color:#0D0D0D;border-bottom:2px solid #C9A96E;padding-bottom:8px;">
      📅 Détails de la location
    </h2>
    <table width="100%" cellpadding="7" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
      <tr><td style="color:#888;width:130px;">Véhicule</td><td style="font-weight:bold;">${p.vehicle}</td></tr>
      <tr style="background:#f9f9f9;"><td style="color:#888;">Date début</td><td style="font-weight:bold;">${p.debut}</td></tr>
      <tr><td style="color:#888;">Date fin</td><td style="font-weight:bold;">${p.fin}</td></tr>
      ${p.jours  ? `<tr style="background:#f9f9f9;"><td style="color:#888;">Durée</td><td>${p.jours} jour(s)</td></tr>` : ''}
      ${p.saison ? `<tr><td style="color:#888;">Saison</td><td>${p.saison}</td></tr>` : ''}
      ${p.lieu   ? `<tr style="background:#f9f9f9;"><td style="color:#888;">📍 Lieu</td><td style="font-weight:bold;">${p.lieu}</td></tr>` : ''}
      ${p.total  ? `<tr><td style="color:#888;">Total estimé</td>
        <td style="font-weight:bold;font-size:18px;color:#C9A96E;">${p.total} MAD</td></tr>` : ''}
    </table>

    ${p.notes ? `
    <h2 style="margin:25px 0 12px;font-size:15px;color:#0D0D0D;border-bottom:2px solid #C9A96E;padding-bottom:8px;">
      📝 Notes du client
    </h2>
    <div style="background:#f9f9f9;border-left:3px solid #C9A96E;padding:14px 18px;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${p.notes}</div>` : ''}

    <div style="margin-top:25px;">
      <a href="mailto:${p.email}" style="display:inline-block;background:#C9A96E;color:#0D0D0D;padding:10px 20px;text-decoration:none;font-weight:bold;font-size:13px;margin-right:10px;">
        ✉️ Répondre par e-mail
      </a>
      <a href="https://wa.me/${tel}" style="display:inline-block;background:#25D366;color:#fff;padding:10px 20px;text-decoration:none;font-weight:bold;font-size:13px;">
        💬 WhatsApp
      </a>
    </div>

  </td></tr>

  <tr><td style="background:#0D0D0D;padding:18px 30px;text-align:center;">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">
      Benroubi Car · 80 Bd Rahmouni Boualam, Oujda · +212 6 62 11 43 21
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
