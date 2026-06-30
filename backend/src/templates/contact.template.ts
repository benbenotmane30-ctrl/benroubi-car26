/**
 * Template HTML pour les messages de contact reçus depuis le formulaire du site.
 */

interface Params {
  nom: string;
  email: string;
  tel?: string;
  sujet?: string;
  message: string;
}

export function contactTemplate(p: Params): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">

  <tr><td style="background:#0D0D0D;padding:24px 30px;">
    <h1 style="margin:0;font-size:22px;color:#fff;font-family:Georgia,serif;font-weight:300;">
      Benroubi <span style="color:#C9A96E;">Car</span>
    </h1>
    <p style="margin:5px 0 0;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;">
      Nouveau message de contact
    </p>
  </td></tr>

  <tr><td style="padding:30px;">
    <table width="100%" cellpadding="7" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
      <tr><td style="color:#888;width:100px;">De</td><td style="font-weight:bold;">${p.nom}</td></tr>
      <tr style="background:#f9f9f9;"><td style="color:#888;">E-mail</td>
        <td><a href="mailto:${p.email}" style="color:#C9A96E;">${p.email}</a></td></tr>
      ${p.tel ? `<tr><td style="color:#888;">Téléphone</td>
        <td><a href="tel:${(p.tel || '').replace(/\s/g, '')}" style="color:#C9A96E;text-decoration:none;font-weight:bold;">${p.tel}</a></td></tr>
      <tr style="background:#f9f9f9;"><td style="color:#888;">Sujet</td><td style="font-weight:bold;">${p.sujet || '(aucun sujet)'}</td></tr>` : `<tr><td style="color:#888;">Sujet</td><td style="font-weight:bold;">${p.sujet || '(aucun sujet)'}</td></tr>`}
    </table>
    <div style="margin-top:20px;padding:16px;background:#f9f9f9;border-left:3px solid #C9A96E;">
      <p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${p.message}</p>
    </div>
    <div style="margin-top:20px;">
      <a href="mailto:${p.email}" style="display:inline-block;background:#C9A96E;color:#0D0D0D;padding:10px 20px;text-decoration:none;font-weight:bold;font-size:13px;">
        ✉️ Répondre
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
