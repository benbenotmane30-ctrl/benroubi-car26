/**
 * Email de confirmation envoyé au CLIENT après une demande de réservation.
 */

interface Params {
  vehicle: string;
  prenom: string;
  debut: string;
  fin: string;
  total?: string;
}

export function bookingClientTemplate(p: Params): string {
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
      Confirmation de votre demande
    </p>
  </td></tr>

  <tr><td style="padding:30px;">
    <p style="font-size:16px;color:#0D0D0D;">Bonjour <strong>${p.prenom}</strong>,</p>
    <p style="font-size:14px;color:#555;line-height:1.7;">
      Nous avons bien reçu votre demande de disponibilité pour le véhicule
      <strong style="color:#0D0D0D;">${p.vehicle}</strong>
      du <strong>${p.debut}</strong> au <strong>${p.fin}</strong>.
    </p>
    <p style="font-size:14px;color:#555;line-height:1.7;">
      Notre équipe vous contactera dans les <strong>2 heures</strong> pour confirmer
      votre réservation et vous communiquer les modalités.
    </p>

    ${p.total ? `
    <div style="background:#f9f9f9;border-left:4px solid #C9A96E;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#888;">Total estimé</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#C9A96E;">${p.total} MAD</p>
      <p style="margin:4px 0 0;font-size:11px;color:#aaa;">Tarif indicatif — confirmé par notre équipe</p>
    </div>` : ''}

    <p style="font-size:14px;color:#555;line-height:1.7;">
      Pour toute question urgente, contactez-nous directement :
    </p>
    <a href="https://wa.me/212662114321" style="display:inline-block;background:#25D366;color:#fff;padding:10px 20px;text-decoration:none;font-weight:bold;font-size:13px;margin-top:5px;">
      💬 WhatsApp : +212 6 62 11 43 21
    </a>
  </td></tr>

  <tr><td style="background:#0D0D0D;padding:18px 30px;text-align:center;">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">
      Benroubi Car · 80 Bd Rahmouni Boualam, Oujda, Maroc<br>
      +212 6 62 11 43 21 · benroubicar@yahoo.fr
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
