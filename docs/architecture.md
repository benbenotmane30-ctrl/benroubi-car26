# Architecture — Benroubi Car

## 1. Vue d'ensemble

Benroubi Car est une application web full-stack de gestion d'une agence de location de voitures située à Oujda, Maroc. Le projet est organisé en **3 applications indépendantes** déployables séparément, partageant une base de données PostgreSQL commune.

```
┌─────────────────────────────────────────────────────────────┐
│                       UTILISATEURS                          │
├──────────────────────────┬──────────────────────────────────┤
│   Clients (publics)      │   Administrateurs                │
│   port 5173              │   port 5174                      │
│   (Site public)          │   (Dashboard admin)              │
└──────────────────────────┴──────────────────────────────────┘
              │                          │
              │  Requêtes REST/JSON      │
              ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND API EXPRESS                        │
│                       port 3000                             │
│  Routes → Controllers → Services → Repository → Prisma      │
└─────────────────────────────────────────────────────────────┘
              │                │                  │
              ▼                ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐
│   PostgreSQL     │  │  Brevo API       │  │ Cron Jobs    │
│   (Supabase)     │  │  (Emails HTTPS)  │  │ (node-cron)  │
└──────────────────┘  └──────────────────┘  └──────────────┘
```

---

## 2. Les 4 modules du projet

### 📁 `frontend/` — Site public client

**Rôle** : Site vitrine accessible aux visiteurs et clients.

**Pages** :
- **Accueil** — Hero avec photo voiture dynamique, présentation agence
- **Catalogue** — Liste filtrable des véhicules (citadines, berlines, SUV) avec toggle haute/basse saison
- **Agence** — Carte Google Maps + infos pratiques
- **Contact** — Formulaire de message + numéros + email + WhatsApp
- **Modal de réservation** — Tunnel de réservation premium (dates, lieu, permis upload)

**Stack** : React 19 + Vite 8 + TypeScript 5 + React Router 7 + Axios + CSS pur (palette noir/or)

---

### 📁 `backend/` — API REST

**Rôle** : Cœur métier — expose tous les endpoints REST, gère l'authentification, la BDD, les emails, les tâches planifiées.

**Architecture clean en couches** :
```
HTTP Request
    ↓
[Middleware]   → rate limiting, CORS, auth, error handling
    ↓
[Routes]       → mapping URL ↔ controller
    ↓
[Controllers]  → validation des inputs, appel des services
    ↓
[Services]     → logique métier (audit, alertes, emails)
    ↓
[Repository]   → DAO Prisma (toutes les requêtes BDD)
    ↓
PostgreSQL
```

**Modules principaux** :
- **Auth** — login (bcrypt), JWT-like HMAC-SHA256, 2 rôles (ADMIN, SUPER_ADMIN)
- **Cars** — CRUD catalogue + sync hybride avec l'admin
- **Bookings** — création de réservation + email notification agence
- **Contact** — formulaire de contact → email
- **Users** — gestion comptes administrateurs (Super Admin only)
- **Audit** — journal des actions (création/modif/suppression)
- **Insurances** — polices d'assurance (CRUD)
- **VisiteTechnique** — contrôles techniques (CRUD)
- **Alerts** — détection des échéances < 7 jours + envoi email + cron quotidien 8h

**Stack** : Node.js 18+ + Express 4 + TypeScript 5 + Prisma ORM 5 + bcryptjs + node-cron + dotenv

---

### 📁 `backend/admin/` — Dashboard administrateur

**Rôle** : Interface de gestion utilisée par les administrateurs de l'agence.

**Pages** :
- **Tableau de bord** — KPIs (nombre voitures, dispos, réservations…)
- **Véhicules** — Tableau filtrable, drawer création/édition, upload photos
- **Aperçu catalogue** — Prévisualisation du rendu client
- **Sauvegarde** — Download/restore JSON complet
- **Mon profil** — Édition infos + changement mot de passe
- **Gestion comptes** *(Super Admin)* — CRUD administrateurs
- **Journal d'audit** *(Super Admin)* — Historique des actions
- **Fins d'assurance** — Tableau échéances + filtre Par véhicule/Historique
- **Fins de visite technique** — idem

**Stratégie de stockage hybride** :
- **localStorage** = source primaire (rapide, offline-first)
- **API backend** = sync cloud (multi-navigateur)
- À chaque save : write localStorage immédiat + push cloud en arrière-plan (debounce 1.5s)
- Au boot : pull cloud → si plus récent que local → adopte le cloud
- Auto-recovery : si cloud vide + local plein → repush local vers cloud
- Protection anti-wipe : refus de pousser un tableau vide sans flag explicite

**Stack** : React 19 + Vite 8 + TypeScript 5 + React Router 7 + Axios + CSS pur

---

### 📁 `legacy/` — Anciennes versions archivées

**Rôle** : Conservation des prototypes HTML/CSS/JS pré-refonte React. Sert de référence visuelle (palette, composants) mais n'est pas déployé.

**Contenu** :
- `location-voitures.html` — Site public original (1 fichier HTML monolithique)
- `admin-benroubi.html` — Premier prototype admin
- Server.js Node de l'ancien backend (en mémoire / Upstash Redis)

---

## 3. Stack technique complète

| Couche | Technologie | Version | Rôle |
|--------|-------------|---------|------|
| **Frontend client** | React | 19 | UI |
| | Vite | 8 | Bundler/Dev server |
| | TypeScript | 5 | Typage statique |
| | React Router | 7 | Routing SPA |
| | Axios | 1.x | Client HTTP |
| **Admin** | (idem frontend) | | |
| **Backend** | Node.js | ≥18 | Runtime |
| | Express | 4 | Framework HTTP |
| | TypeScript | 5 | Typage statique |
| | Prisma ORM | 5 | DAO + migrations |
| | bcryptjs | 2.x | Hash passwords |
| | node-cron | 3.x | Tâches planifiées |
| | dotenv | 16.x | Variables d'env |
| | express-rate-limit | 7.x | Anti brute-force |
| **Base de données** | PostgreSQL | 15+ | SGBD |
| | Supabase | cloud | Hébergement managé |
| **Email** | Brevo (ex Sendinblue) | API v3 HTTPS | Transactional emails |
| **Auth** | JWT-like HMAC-SHA256 | — | Tokens session |
| **Déploiement** *(prévu)* | Vercel ou Netlify | — | Frontend + Admin |
| | Render ou Railway | — | Backend |

---

## 4. Flux de données critiques

### 4.1 Réservation client

```
[Client]                  [Frontend]              [Backend]               [BDD + Email]
   │                         │                       │                          │
   ├─ Sélectionne voiture →  │                       │                          │
   │                         ├─ POST /bookings ────→ │                          │
   │                         │                       ├─ Validation              │
   │                         │                       ├─ INSERT booking ───────→ │
   │                         │                       ├─ sendEmail (Brevo) ────→ │
   │                         │                       │                    [agence email]
   │                         │ ←── 200 OK ────────── │                          │
   │ ←── Confirmation UI ─── │                       │                          │
```

### 4.2 Sync admin → site client (temps quasi-réel)

```
[Admin]              [API]                  [BDD]              [Frontend client]
   │                   │                       │                       │
   ├─ Modifie voiture  │                       │                       │
   ├─ debounce 1.5s    │                       │                       │
   ├──────── PUT /admin/cars ──→ │                                     │
   │                   ├─ replaceAll ────────→ │                       │
   │                   │ ← OK                   │                       │
   │                   │                       │ ←── GET /cars ─────── │ (polling 10s)
   │                   │                       │     OU visibilitychange
   │                   │                       │                       │
   │                   │                       │     → mise à jour UI silencieuse
```

### 4.3 Alerte d'échéance (cron quotidien)

```
[Cron 8h00 Maroc]    [Alerts Service]    [BDD]            [Brevo API]      [Admins]
   │                   │                    │                  │                │
   ├─ tick ─────────→  │                    │                  │                │
   │                   ├─ Récup échéances < 7j AND alertSentAt = null →         │
   │                   │ ← liste                                                │
   │                   ├─ Récup admins actifs (avec email) →                    │
   │                   │ ← liste                                                │
   │                   ├─ Pour chaque admin :                                   │
   │                   │   ├─ Build email récap                                 │
   │                   │   ├─ sendEmail (Brevo) ───────────────→ │              │
   │                   │   │                                     │ → email reçu │
   │                   ├─ Marque alertSentAt = NOW → │                          │
   │                   ├─ Log audit "alert.sent" → │                            │
```

---

## 5. Sécurité

| Aspect | Implémentation |
|--------|----------------|
| Passwords | bcrypt avec salt automatique (workFactor 10) |
| Sessions | JWT-like signé HMAC-SHA256 (expire 8h par défaut) |
| Anti brute-force login | express-rate-limit (15 essais / 15 min en dev) |
| Anti brute-force général | express-rate-limit (2000 req / 15 min en dev) |
| CORS | Liste blanche frontend (5173) + admin (5174) + wildcard `localhost:*` en dev |
| SQL injection | Prisma ORM (paramètres préparés automatiques) |
| XSS | React échappe par défaut, pas de `dangerouslySetInnerHTML` |
| Rôles | Middleware `requireAuth` + `requireSuperAdmin` |
| Audit | Toutes les actions sensibles loggées en BDD |
| Anti-wipe BDD | Endpoint `replaceAll` refuse `cars: []` sans flag `confirmEmpty: true` |
| Secrets | Stockés dans `.env` (jamais commit, `.env.example` versionné) |

---

## 6. Ports utilisés en dev

| Port | Service | URL |
|------|---------|-----|
| 3000 | Backend API | http://localhost:3000 |
| 5173 | Frontend client | http://localhost:5173 |
| 5174 | Admin dashboard | http://localhost:5174 |
| 5432 | PostgreSQL (via Supabase pooler session) | aws-0-eu-west-3.pooler.supabase.com:5432 |
| 6543 | PostgreSQL (via Supabase pooler transaction) | aws-0-eu-west-3.pooler.supabase.com:6543 |

---

## 7. Commandes de démarrage en dev

3 terminaux en parallèle :

```powershell
# Terminal 1 — Backend API
cd backend
npm run dev

# Terminal 2 — Frontend client
cd frontend
npm run dev

# Terminal 3 — Admin dashboard
cd backend\admin
npm run dev
```

Voir [`deployment.md`](deployment.md) pour le déploiement en production.
