# Benroubi Car — Backend API

API REST pour l'application Benroubi Car (location de voitures à Oujda).

## 🛠️ Stack technique

- **Runtime** : Node.js 18+
- **Framework** : Express.js
- **Langage** : TypeScript
- **ORM** : Prisma
- **Base de données** : PostgreSQL (Supabase / Neon / Railway)
- **Email** : Brevo HTTP API
- **Auth** : JWT-like signé HMAC-SHA256

## 📁 Architecture

```
src/
├── config/         # Configuration centralisée (env, db)
├── routes/         # Définition des routes Express
├── controllers/    # Logique métier des endpoints
├── services/       # Services externes (Brevo, Upstash, ...)
├── middleware/     # Middlewares Express (auth, rate-limit, ...)
├── utils/          # Utilitaires (crypto, validation, ...)
├── templates/      # Templates HTML des emails
├── types/          # Types TypeScript partagés
├── app.ts          # Configuration Express
└── server.ts       # Point d'entrée

prisma/
├── schema.prisma   # Modèle de données
└── migrations/     # Historique des migrations DB
```

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# (puis éditer .env avec vos vraies valeurs)

# 3. Générer le client Prisma
npm run prisma:generate

# 4. Appliquer les migrations DB
npm run prisma:migrate

# 5. Lancer en développement (hot-reload)
npm run dev
```

## 📋 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev`              | Démarre le serveur en mode dev (hot-reload via tsx) |
| `npm run build`            | Compile TypeScript → JavaScript dans `dist/` |
| `npm start`                | Lance le serveur compilé en production |
| `npm run prisma:generate`  | Régénère le client Prisma typé |
| `npm run prisma:migrate`   | Crée/applique une migration de schéma |
| `npm run prisma:studio`    | Lance Prisma Studio (UI pour la DB) |
| `npm run lint`             | Type-check sans compilation |

## 📡 Endpoints

| Méthode | Route                  | Auth | Description                          |
|---------|------------------------|------|--------------------------------------|
| GET     | `/`                    | ❌   | Health check + liste des endpoints   |
| GET     | `/api/ping`            | ❌   | Keepalive (UptimeRobot)              |
| POST    | `/api/auth/login`      | ❌   | Authentification admin               |
| GET     | `/api/auth/verify`     | ✅   | Vérification d'un token              |
| GET     | `/api/cars`            | ❌   | Liste publique des voitures          |
| POST    | `/api/admin/cars`      | ✅   | Créer une voiture                    |
| PUT     | `/api/admin/cars/:id`  | ✅   | Modifier une voiture                 |
| DELETE  | `/api/admin/cars/:id`  | ✅   | Supprimer une voiture                |
| POST    | `/api/bookings`        | ❌   | Soumettre une demande de réservation |
| POST    | `/api/contact`         | ❌   | Soumettre un message de contact      |

## 🚢 Déploiement

Le backend est déployé sur **Render.com** (plan gratuit).

URL production : `https://benroubi-car-api.onrender.com`

Voir [docs/deployment.md](../docs/deployment.md) pour la procédure complète.
