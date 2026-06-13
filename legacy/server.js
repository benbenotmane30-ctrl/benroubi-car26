// ═══════════════════════════════════════════════════════
//  Benroubi Car — Serveur Node.js
//  Express + Brevo HTTP API + Multer
//  Déployé sur Render.com (free tier compatible — pas de SMTP)
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const express   = require('express');
const multer    = require('multer');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const crypto    = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── FIX RENDER : trust proxy (obligatoire sur Render) ──
app.set('trust proxy', 1);

// ── MIDDLEWARES ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de requêtes. Réessayez dans 15 minutes.' }
});
app.use('/api/', limiter);

// Limit plus strict pour le login (anti brute-force) : 8 tentatives / 15 min / IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' }
});

// ── MULTER — Gestion des fichiers (permis de conduire) ──
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non accepté. Utilisez JPG, PNG, WEBP ou PDF.'));
    }
  }
});

// ══════════════════════════════════════════
//  BREVO — Envoi via HTTPS (port 443, jamais bloqué sur Render free)
// ══════════════════════════════════════════
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL  = process.env.SENDER_EMAIL || process.env.GMAIL_USER;
const SENDER_NAME   = process.env.SENDER_NAME  || 'Benroubi Car';
const DEST_EMAIL    = process.env.DEST_EMAIL;

console.log('🔧 Brevo HTTP API config :');
console.log('   - BREVO_API_KEY présent :', !!BREVO_API_KEY, BREVO_API_KEY ? `(longueur ${BREVO_API_KEY.length})` : '(MANQUANT!)');
console.log('   - SENDER_EMAIL          :', SENDER_EMAIL || '(MANQUANT!)');
console.log('   - DEST_EMAIL            :', DEST_EMAIL    || '(MANQUANT!)');

/**
 * Envoie un email via l'API Brevo (HTTPS).
 * @param {Object} opts
 * @param {string} opts.to         destinataire
 * @param {string} opts.subject    sujet
 * @param {string} opts.html       contenu HTML
 * @param {string} [opts.replyTo]  reply-to optionnel
 * @param {Array}  [opts.attachments] [{ name, contentBase64 }]
 */
async function sendBrevoEmail({ to, subject, html, replyTo, attachments }) {
  if (!BREVO_API_KEY) throw new Error('BREVO_API_KEY manquant');
  if (!SENDER_EMAIL)  throw new Error('SENDER_EMAIL manquant');

  const body = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html
  };
  if (replyTo)      body.replyTo = { email: replyTo };
  if (attachments && attachments.length) {
    body.attachment = attachments.map(a => ({ name: a.name, content: a.contentBase64 }));
  }

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': BREVO_API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`Brevo HTTP ${res.status}: ${errText}`);
    err.status = res.status;
    err.brevoBody = errText;
    throw err;
  }
  return res.json();
}

// ══════════════════════════════════════════
//  UPSTASH REDIS — Cloud storage pour les voitures
// ══════════════════════════════════════════
const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL   || '';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';
const CARS_KEY      = 'bc:cars';
const CARS_TS_KEY   = 'bc:cars:updatedAt';
const MAX_CLOUD_SIZE_BYTES = 900_000; // 900 KB, marge sous la limite Upstash de 1 MB

console.log('☁️  Upstash :');
console.log('   - UPSTASH_REDIS_REST_URL présent   :', !!UPSTASH_URL);
console.log('   - UPSTASH_REDIS_REST_TOKEN présent :', !!UPSTASH_TOKEN);

const upstashEnabled = () => !!(UPSTASH_URL && UPSTASH_TOKEN);

async function upstashGet(key) {
  if (!upstashEnabled()) throw new Error('Upstash non configuré');
  const r = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`Upstash GET HTTP ${r.status}: ${txt.slice(0, 200)}`);
  }
  const data = await r.json();
  return data.result; // string ou null
}

async function upstashSet(key, value) {
  if (!upstashEnabled()) throw new Error('Upstash non configuré');
  const r = await fetch(`${UPSTASH_URL}/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(['SET', key, value])
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`Upstash SET HTTP ${r.status}: ${txt.slice(0, 200)}`);
  }
  return r.json();
}

// ══════════════════════════════════════════
//  ADMIN AUTH — login + token signé HMAC
// ══════════════════════════════════════════
const ADMIN_USER       = (process.env.ADMIN_USER || '').toLowerCase();
const ADMIN_PASS_HASH  = (process.env.ADMIN_PASS_HASH || '').toLowerCase();
const SESSION_SECRET   = process.env.SESSION_SECRET || '';
const SESSION_TTL_MS   = 8 * 60 * 60 * 1000; // 8 h

console.log('🔐 Admin auth :');
console.log('   - ADMIN_USER présent      :', !!ADMIN_USER);
console.log('   - ADMIN_PASS_HASH présent :', !!ADMIN_PASS_HASH, ADMIN_PASS_HASH ? `(longueur ${ADMIN_PASS_HASH.length})` : '');
console.log('   - SESSION_SECRET présent  :', !!SESSION_SECRET);

function sha256Hex(str) {
  return crypto.createHash('sha256').update(String(str), 'utf8').digest('hex');
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');
}
function b64urlDecode(s) {
  s = s.replace(/-/g,'+').replace(/_/g,'/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64');
}

function signSession(payload) {
  if (!SESSION_SECRET) throw new Error('SESSION_SECRET manquant');
  const body = b64url(JSON.stringify(payload));
  const sig  = b64url(crypto.createHmac('sha256', SESSION_SECRET).update(body).digest());
  return body + '.' + sig;
}

function verifySession(token) {
  if (!token || typeof token !== 'string' || !SESSION_SECRET) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = b64url(crypto.createHmac('sha256', SESSION_SECRET).update(body).digest());
  // Constant-time compare
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body).toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

// Middleware pour les routes admin protégées
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const payload = verifySession(token);
  if (!payload) return res.status(401).json({ success: false, message: 'Session invalide ou expirée. Reconnectez-vous.' });
  req.admin = payload;
  next();
}

// ══════════════════════════════════════════
//  TEMPLATES E-MAIL
// ══════════════════════════════════════════

function buildBookingEmailAdmin({ vehicle, prenom, nom, email, tel, debut, fin, saison, total, jours, lieu, notes }) {
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
    <p style="margin:0;font-size:15px;font-weight:bold;color:#0D0D0D;">🚗 ${vehicle}</p>
  </td></tr>

  <tr><td style="padding:30px;">

    <h2 style="margin:0 0 16px;font-size:15px;color:#0D0D0D;border-bottom:2px solid #C9A96E;padding-bottom:8px;">
      👤 Informations du client
    </h2>
    <table width="100%" cellpadding="7" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
      <tr><td style="color:#888;width:130px;">Nom complet</td><td style="font-weight:bold;color:#0D0D0D;">${prenom} ${nom}</td></tr>
      <tr style="background:#f9f9f9;"><td style="color:#888;">E-mail</td>
        <td><a href="mailto:${email}" style="color:#C9A96E;text-decoration:none;">${email}</a></td></tr>
      <tr><td style="color:#888;">Téléphone</td>
        <td><a href="tel:${tel}" style="color:#C9A96E;text-decoration:none;">${tel}</a></td></tr>
    </table>

    <h2 style="margin:25px 0 16px;font-size:15px;color:#0D0D0D;border-bottom:2px solid #C9A96E;padding-bottom:8px;">
      📅 Détails de la location
    </h2>
    <table width="100%" cellpadding="7" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
      <tr><td style="color:#888;width:130px;">Véhicule</td><td style="font-weight:bold;">${vehicle}</td></tr>
      <tr style="background:#f9f9f9;"><td style="color:#888;">Date début</td><td style="font-weight:bold;">${debut}</td></tr>
      <tr><td style="color:#888;">Date fin</td><td style="font-weight:bold;">${fin}</td></tr>
      ${jours ? `<tr style="background:#f9f9f9;"><td style="color:#888;">Durée</td><td>${jours} jour(s)</td></tr>` : ''}
      ${saison ? `<tr><td style="color:#888;">Saison</td><td>${saison}</td></tr>` : ''}
      ${lieu ? `<tr style="background:#f9f9f9;"><td style="color:#888;">📍 Lieu</td><td style="font-weight:bold;">${lieu}</td></tr>` : ''}
      ${total ? `<tr><td style="color:#888;">Total estimé</td>
        <td style="font-weight:bold;font-size:18px;color:#C9A96E;">${total} MAD</td></tr>` : ''}
    </table>

    ${notes ? `
    <h2 style="margin:25px 0 12px;font-size:15px;color:#0D0D0D;border-bottom:2px solid #C9A96E;padding-bottom:8px;">
      📝 Notes du client
    </h2>
    <div style="background:#f9f9f9;border-left:3px solid #C9A96E;padding:14px 18px;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${notes}</div>` : ''}

    <div style="margin-top:25px;">
      <a href="mailto:${email}" style="display:inline-block;background:#C9A96E;color:#0D0D0D;padding:10px 20px;text-decoration:none;font-weight:bold;font-size:13px;margin-right:10px;">
        ✉️ Répondre par e-mail
      </a>
      <a href="https://wa.me/${(tel||'').replace(/\D/g,'')}" style="display:inline-block;background:#25D366;color:#fff;padding:10px 20px;text-decoration:none;font-weight:bold;font-size:13px;">
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

function buildBookingEmailClient({ vehicle, prenom, debut, fin, total }) {
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
    <p style="font-size:16px;color:#0D0D0D;">Bonjour <strong>${prenom}</strong>,</p>
    <p style="font-size:14px;color:#555;line-height:1.7;">
      Nous avons bien reçu votre demande de disponibilité pour le véhicule
      <strong style="color:#0D0D0D;">${vehicle}</strong>
      du <strong>${debut}</strong> au <strong>${fin}</strong>.
    </p>
    <p style="font-size:14px;color:#555;line-height:1.7;">
      Notre équipe vous contactera dans les <strong>2 heures</strong> pour confirmer
      votre réservation et vous communiquer les modalités.
    </p>

    ${total ? `
    <div style="background:#f9f9f9;border-left:4px solid #C9A96E;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#888;">Total estimé</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#C9A96E;">${total} MAD</p>
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

function buildContactEmail({ nom, email, sujet, message }) {
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
      <tr><td style="color:#888;width:100px;">De</td><td style="font-weight:bold;">${nom}</td></tr>
      <tr style="background:#f9f9f9;"><td style="color:#888;">E-mail</td>
        <td><a href="mailto:${email}" style="color:#C9A96E;">${email}</a></td></tr>
      <tr><td style="color:#888;">Sujet</td><td style="font-weight:bold;">${sujet || '(aucun sujet)'}</td></tr>
    </table>
    <div style="margin-top:20px;padding:16px;background:#f9f9f9;border-left:3px solid #C9A96E;">
      <p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${message}</p>
    </div>
    <div style="margin-top:20px;">
      <a href="mailto:${email}" style="display:inline-block;background:#C9A96E;color:#0D0D0D;padding:10px 20px;text-decoration:none;font-weight:bold;font-size:13px;">
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

// ══════════════════════════════════════════
//  ROUTES
// ══════════════════════════════════════════

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Benroubi Car API',
    version: '2.2.0 (Brevo + Admin Auth + Upstash Cloud Sync)',
    endpoints: [
      'GET  /api/ping          — Keepalive',
      'GET  /api/test-mail     — Test envoi (diagnostic)',
      'POST /api/booking       — Demande de réservation',
      'POST /api/contact       — Formulaire de contact',
      'POST /api/admin/login   — Authentification admin',
      'GET  /api/admin/verify  — Vérifier un token admin',
      'GET  /api/cars          — Liste des voitures (public, depuis cloud)',
      'PUT  /api/admin/cars    — Sauvegarder les voitures (auth)'
    ]
  });
});

app.get('/api/ping', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// ── POST /api/admin/login — Authentifie l'admin et renvoie un token signé ──
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const username = (req.body && req.body.username || '').toString().trim().toLowerCase();
  const password = (req.body && req.body.password || '').toString();

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Identifiant et mot de passe requis.' });
  }
  if (!ADMIN_USER || !ADMIN_PASS_HASH || !SESSION_SECRET) {
    console.error('❌ /api/admin/login : variables d\'env manquantes (ADMIN_USER, ADMIN_PASS_HASH, SESSION_SECRET)');
    return res.status(500).json({ success: false, message: 'Authentification non configurée sur le serveur.' });
  }

  // Comparaison à temps constant (résistante aux attaques par timing)
  const givenHash = sha256Hex(password);
  const a = Buffer.from(givenHash, 'utf8');
  const b = Buffer.from(ADMIN_PASS_HASH, 'utf8');
  const passOk = a.length === b.length && crypto.timingSafeEqual(a, b);
  const userOk = username === ADMIN_USER;

  if (!userOk || !passOk) {
    // Petit délai aléatoire pour ralentir le brute-force
    return setTimeout(() => res.status(401).json({ success: false, message: 'Identifiants incorrects.' }), 250 + Math.random()*250);
  }

  const exp = Date.now() + SESSION_TTL_MS;
  const token = signSession({ u: ADMIN_USER, exp, iat: Date.now() });
  console.log(`✅ Admin login OK — ${ADMIN_USER} — IP ${req.ip}`);
  res.json({ success: true, token, expiresAt: exp });
});

// ══════════════════════════════════════════
//  CARS SYNC — Upstash
// ══════════════════════════════════════════

// ── GET /api/cars — PUBLIC : renvoie la liste des voitures (sans photos) ──
// Utilisé par le catalogue côté front pour avoir les données à jour
app.get('/api/cars', async (req, res) => {
  if (!upstashEnabled()) {
    return res.json({ success: true, cars: [], cloudEnabled: false, message: 'Cloud non configuré' });
  }
  try {
    const [raw, ts] = await Promise.all([
      upstashGet(CARS_KEY).catch(() => null),
      upstashGet(CARS_TS_KEY).catch(() => null)
    ]);
    const cars = raw ? JSON.parse(raw) : [];
    res.json({
      success: true,
      cars,
      cloudEnabled: true,
      updatedAt: ts ? parseInt(ts, 10) || null : null,
      count: cars.length
    });
  } catch (err) {
    console.error('❌ /api/cars:', err.message);
    res.status(500).json({ success: false, message: 'Erreur de lecture cloud.', error: err.message });
  }
});

// ── PUT /api/admin/cars — AUTH : sauvegarde la liste des voitures dans le cloud ──
// Le client envoie un tableau ; on retire les photos avant stockage (trop lourdes pour Upstash free)
app.put('/api/admin/cars', requireAuth, async (req, res) => {
  if (!upstashEnabled()) {
    return res.status(503).json({ success: false, message: 'Cloud sync non configuré sur le serveur.' });
  }
  try {
    const cars = req.body && req.body.cars;
    if (!Array.isArray(cars)) {
      return res.status(422).json({ success: false, message: 'Body invalide : { cars: [...] } attendu.' });
    }

    // On retire les photos (trop volumineuses pour Upstash free, restent en localStorage local)
    const stripped = cars.map(c => {
      const { photos, ...rest } = c;
      return rest;
    });
    const json = JSON.stringify(stripped);
    if (json.length > MAX_CLOUD_SIZE_BYTES) {
      return res.status(413).json({
        success: false,
        message: `Données trop volumineuses (${Math.round(json.length/1024)} KB > ${Math.round(MAX_CLOUD_SIZE_BYTES/1024)} KB).`
      });
    }

    const now = Date.now();
    await Promise.all([
      upstashSet(CARS_KEY, json),
      upstashSet(CARS_TS_KEY, String(now))
    ]);

    console.log(`☁️  Sync OK — ${stripped.length} voitures (${Math.round(json.length/1024)} KB) — admin ${req.admin.u}`);
    res.json({ success: true, count: stripped.length, sizeKB: Math.round(json.length/1024), updatedAt: now });
  } catch (err) {
    console.error('❌ /api/admin/cars:', err.message);
    res.status(500).json({ success: false, message: 'Erreur d\'écriture cloud.', error: err.message });
  }
});

// ── GET /api/admin/verify — Vérifie qu'un token est encore valide ──
app.get('/api/admin/verify', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const payload = verifySession(token);
  if (!payload) return res.status(401).json({ success: false });
  res.json({ success: true, user: payload.u, expiresAt: payload.exp });
});

// Diagnostic : envoie un email de test et renvoie l'erreur exacte si KO
app.get('/api/test-mail', async (req, res) => {
  try {
    const result = await sendBrevoEmail({
      to: DEST_EMAIL,
      subject: '🧪 Test Benroubi Car API (via Brevo)',
      html: '<p>Si vous lisez ceci, <strong>Brevo fonctionne</strong> !</p>'
    });
    res.json({ success: true, message: 'E-mail envoyé à ' + DEST_EMAIL, result });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { message: err.message, status: err.status, brevoBody: err.brevoBody },
      env: {
        brevo_api_key_present: !!BREVO_API_KEY,
        brevo_api_key_length: BREVO_API_KEY ? BREVO_API_KEY.length : 0,
        sender_email: SENDER_EMAIL,
        dest_email: DEST_EMAIL
      }
    });
  }
});

// ── POST /api/booking — Demande de réservation ──
const bookingUpload = upload.fields([
  { name: 'permis_recto', maxCount: 1 },
  { name: 'permis_verso', maxCount: 1 },
  { name: 'permis',       maxCount: 1 }  // back-compat (ancien front)
]);

app.post('/api/booking', bookingUpload, async (req, res) => {
  try {
    const { vehicle, prenom, nom, email, tel, debut, fin, saison, total, jours, lieu, notes } = req.body;

    if (!prenom || !nom)        return res.status(422).json({ success: false, message: 'Prénom et nom requis.' });
    if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(422).json({ success: false, message: 'E-mail invalide.' });
    if (!tel)                   return res.status(422).json({ success: false, message: 'Téléphone requis.' });
    if (!vehicle)               return res.status(422).json({ success: false, message: 'Véhicule non spécifié.' });
    if (!debut || !fin)         return res.status(422).json({ success: false, message: 'Dates requises.' });

    // Pièces jointes : recto + verso (ou ancien champ "permis" pour rétro-compatibilité)
    const attachments = [];
    const files = req.files || {};
    const safe = (s) => (s || '').replace(/[^a-zA-Z0-9._-]/g, '_');
    const addAttachment = (file, baseName) => {
      if (!file) return;
      const ext = (file.originalname && file.originalname.includes('.')) ? file.originalname.split('.').pop() : 'jpg';
      attachments.push({
        name: `${safe(baseName)}_${safe(prenom)}_${safe(nom)}.${ext}`,
        contentBase64: file.buffer.toString('base64')
      });
    };
    if (files.permis_recto && files.permis_recto[0]) addAttachment(files.permis_recto[0], 'permis_recto');
    if (files.permis_verso && files.permis_verso[0]) addAttachment(files.permis_verso[0], 'permis_verso');
    if (files.permis && files.permis[0])             addAttachment(files.permis[0],       'permis');

    // LOG diagnostic : taille des pièces jointes
    const totalBase64KB = attachments.reduce((s, a) => s + a.contentBase64.length, 0) / 1024;
    console.log(`📎 Réservation ${prenom} ${nom} — ${attachments.length} pièce(s) jointe(s), ${Math.round(totalBase64KB)} KB base64`);
    if (totalBase64KB > 9500) {
      console.warn(`⚠️ Pièces jointes trop volumineuses (${Math.round(totalBase64KB)} KB) — Brevo refusera. Envoi SANS pièces jointes.`);
      attachments.length = 0; // on vide pour que l'email parte au moins sans les pièces
    }

    // Email admin
    try {
      await sendBrevoEmail({
        to: DEST_EMAIL,
        replyTo: email,
        subject: `🚗 Réservation — ${vehicle} — ${prenom} ${nom}`,
        html: buildBookingEmailAdmin({ vehicle, prenom, nom, email, tel, debut, fin, saison, total, jours, lieu, notes }),
        attachments
      });
    } catch (mailErr) {
      // Fallback : retenter SANS les pièces jointes si Brevo a refusé à cause de la taille
      console.error('❌ 1er envoi échoué:', mailErr.message);
      if (attachments.length > 0) {
        console.log('🔄 Retry sans pièces jointes...');
        await sendBrevoEmail({
          to: DEST_EMAIL,
          replyTo: email,
          subject: `🚗 Réservation — ${vehicle} — ${prenom} ${nom} (⚠️ permis non envoyé — demander au client)`,
          html: buildBookingEmailAdmin({ vehicle, prenom, nom, email, tel, debut, fin, saison, total, jours, lieu, notes: (notes||'') + '\n\n⚠️ Les photos du permis n\'ont pas pu être envoyées (trop volumineuses). Demander au client de les renvoyer par WhatsApp.' })
        });
      } else {
        throw mailErr;
      }
    }

    // Email confirmation client — non bloquant (si échec, on log mais on confirme quand même)
    try {
      await sendBrevoEmail({
        to: email,
        subject: `✅ Demande reçue — ${vehicle} — Benroubi Car`,
        html: buildBookingEmailClient({ vehicle, prenom, debut, fin, total })
      });
    } catch (e) {
      console.warn('⚠️ Confirmation client échouée:', e.message);
    }

    console.log(`✅ Réservation — ${vehicle} — ${prenom} ${nom} — ${email}`);
    res.json({ success: true, message: 'Votre demande a bien été transmise. Vous recevrez une réponse sous 2h.' });

  } catch (err) {
    console.error('❌ Erreur /api/booking:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer ou nous contacter par WhatsApp.' });
  }
});

// ── POST /api/contact ──
app.post('/api/contact', async (req, res) => {
  try {
    const { nom, email, sujet, message } = req.body;

    if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(422).json({ success: false, message: 'E-mail invalide.' });
    if (!message)  return res.status(422).json({ success: false, message: 'Message requis.' });

    await sendBrevoEmail({
      to: DEST_EMAIL,
      replyTo: email,
      subject: `✉️ Contact — ${sujet || 'Message depuis le site'} — ${nom || email}`,
      html: buildContactEmail({ nom: nom || 'Anonyme', email, sujet, message })
    });

    console.log(`✅ Contact — ${nom} — ${email}`);
    res.json({ success: true, message: 'Message envoyé ! Nous vous répondrons dans les plus brefs délais.' });

  } catch (err) {
    console.error('❌ Erreur /api/contact:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer.' });
  }
});

// ── Gestion des erreurs Multer ──
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(422).json({ success: false, message: 'Fichier trop volumineux (max 5 Mo).' });
  }
  if (err.message) {
    return res.status(422).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: 'Erreur interne.' });
});

// ── DÉMARRAGE ──
app.listen(PORT, () => {
  console.log(`🚀 Benroubi Car API — Port ${PORT}`);
  console.log(`📧 Destination : ${DEST_EMAIL}`);
});
