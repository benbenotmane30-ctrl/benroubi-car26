import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { logBrevoConfig } from './services/brevo.service.js';
import { logUpstashConfig } from './services/upstash.service.js';
import { seedFirstSuperAdmin } from './services/seed.service.js';
import { startCronJobs } from './services/cron.service.js';

export const app = express();

// ─── Trust proxy ────────────────────────────────────
// Indispensable derrière Render/Vercel/Heroku pour que express-rate-limit
// récupère la vraie IP du client depuis le header X-Forwarded-For.
app.set('trust proxy', 1);

// ─── Middlewares globaux ────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const allowedOrigins = [
  ...env.FRONTEND_URL.split(',').map(s => s.trim()),
  ...(env.ADMIN_URL ? env.ADMIN_URL.split(',').map(s => s.trim()) : []),
].filter(Boolean);

const isDev = env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (isDev && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
    cb(new Error(`Origin non autorisée : ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate-limit général sur /api/
app.use('/api/', generalLimiter);

// ─── Logs config au démarrage ───────────────────────
logBrevoConfig();
logUpstashConfig();
console.log('🔐 Admin auth :');
console.log('   - ADMIN_USER         :', env.ADMIN_USER       ? 'OK' : '❌ MANQUANT');
console.log('   - ADMIN_PASS_HASH    :', env.ADMIN_PASS_HASH  ? `OK (${env.ADMIN_PASS_HASH.length} chars)` : '❌ MANQUANT');
console.log('   - SESSION_SECRET     :', env.SESSION_SECRET   ? 'OK' : '❌ MANQUANT');

// Seed du 1er Super Admin (idempotent, ne fait rien si la BDD a déjà des users)
void seedFirstSuperAdmin();

// Démarre les tâches planifiées (alerte échéances 8h)
startCronJobs();

// ─── Routes ─────────────────────────────────────────
app.use(routes);

// ─── Error handler (doit être en dernier) ───────────
app.use(errorHandler);
