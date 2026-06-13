# 🚗 Benroubi Car — Plateforme de location de voitures

> **Projet de fin d'études (PFE)** — Application web full-stack pour la gestion d'une agence de location de voitures à Oujda, Maroc.

[![Tech](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=white)]()
[![Tech](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=nodedotjs&logoColor=white)]()
[![Tech](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)]()
[![Tech](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)]()
[![Tech](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)]()
[![Tech](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)]()

---

## 📋 Description du projet

Plateforme web complète permettant à une agence de location de voitures de :

- Présenter son catalogue de véhicules au public avec tarification saisonnière
- Recevoir des demandes de réservation en ligne (formulaire + upload du permis)
- Gérer son inventaire via un panneau d'administration sécurisé
- Synchroniser les données entre plusieurs appareils via une base de données cloud

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          NAVIGATEUR CLIENT                          │
├──────────────────────────────────┬─────────────────────────────────┤
│       Frontend public            │       Admin Dashboard           │
│       (catalogue + réservation)  │       (gestion flotte + bookings)│
│       React + Vite + Tailwind    │       React + Vite + Tailwind   │
│       :5173                      │       :5174                     │
└──────────────────┬───────────────┴────────────────┬────────────────┘
                   │                                │
                   │  HTTPS REST API                │
                   │                                │
                   └────────────┬───────────────────┘
                                ▼
            ┌─────────────────────────────────────────┐
            │     Backend API — Node.js + Express     │
            │     + TypeScript + Prisma ORM           │
            │     (déployé sur Render)                │
            │     :3000                               │
            └────────┬──────────────────────┬─────────┘
                     │                      │
                     ▼                      ▼
       ┌─────────────────────┐   ┌─────────────────────┐
       │  PostgreSQL          │   │  Brevo HTTP API     │
       │  (Supabase / Neon)   │   │  (emails)           │
       │                      │   │                     │
       │  - cars              │   │  - Booking emails   │
       │  - bookings          │   │  - Contact emails   │
       │  - admin_users       │   │  - Confirmations    │
       └─────────────────────┘   └─────────────────────┘
```

## 📁 Structure du projet

```
benroubi-car/
├── backend/              # API REST Node.js + Express + TS + Prisma
├── frontend/             # Site public React + Vite + Tailwind
├── admin/                # Dashboard admin React + Vite + Tailwind
├── docs/                 # Documentation technique (UML, MCD, API)
├── legacy/               # Ancienne version (vanilla HTML) archivée
└── README.md             # Ce fichier
```

Chaque dossier contient son propre `README.md` avec les instructions détaillées.

## 🛠️ Stack technique complète

### Frontend & Admin
| Couche       | Technologie         |
|--------------|---------------------|
| Framework    | React 19            |
| Bundler      | Vite 8              |
| Langage      | TypeScript 5        |
| Styling      | Tailwind CSS v4     |
| Routing      | React Router 7      |
| HTTP client  | Axios               |

### Backend
| Couche       | Technologie         |
|--------------|---------------------|
| Runtime      | Node.js 18+         |
| Framework    | Express 4           |
| Langage      | TypeScript 5        |
| ORM          | Prisma 5            |
| Base de données | PostgreSQL       |
| Auth         | JWT-like HMAC-SHA256|
| Rate limit   | express-rate-limit  |
| Upload       | Multer              |

### Services externes
- **Hébergement backend** : [Render](https://render.com) (plan gratuit)
- **Hébergement frontend / admin** : [Netlify](https://netlify.com) ou [Vercel](https://vercel.com)
- **Base de données** : [Supabase](https://supabase.com) (PostgreSQL gratuit)
- **Emails transactionnels** : [Brevo](https://brevo.com) (300 emails/jour gratuit)

## 🚀 Démarrage rapide

### Prérequis

- Node.js ≥ 18
- npm ≥ 9
- Git
- Un compte Supabase (pour PostgreSQL)
- Un compte Brevo (pour emails)

### Installation

```bash
# 1. Cloner le repo
git clone <url-du-repo>
cd benroubi-car

# 2. Installer le backend
cd backend
npm install
cp .env.example .env       # puis configurer .env

# 3. Installer le frontend
cd ../frontend
npm install

# 4. Installer l'admin
cd ../admin
npm install
```

### Lancement en développement

Ouvrir 3 terminaux :

```bash
# Terminal 1 — Backend (port 3000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev

# Terminal 3 — Admin (port 5174)
cd admin && npm run dev
```

## ✅ Fonctionnalités principales

### Côté client (frontend)
- [x] Catalogue de véhicules avec photos, prix, disponibilité
- [x] Filtrage par catégorie (citadine, SUV, berline…)
- [x] Calcul automatique du prix selon haute/basse saison
- [x] Formulaire de réservation premium (upload permis recto/verso, lieu, notes)
- [x] Compression d'images côté client
- [x] Formulaire de contact
- [x] Bouton WhatsApp flottant
- [x] Carte Google Maps de l'agence
- [x] Design responsive (mobile, tablette, desktop)

### Côté administration (admin)
- [x] Authentification sécurisée (hash + JWT + rate-limit)
- [x] Dashboard avec KPI temps réel
- [x] Gestion CRUD des véhicules (ajout, modif, suppression, dispo)
- [x] Filtres et recherche dans la flotte
- [x] Upload + preview des photos avec compression
- [x] Sauvegarde manuelle (export/import JSON)
- [x] Synchronisation cloud (multi-appareils)

### Côté serveur (backend)
- [x] API REST documentée
- [x] Envoi d'emails (admin + confirmation client)
- [x] Authentification HMAC-SHA256
- [x] Rate limiting anti brute-force
- [x] Validation des entrées
- [x] Gestion des erreurs centralisée
- [x] Logs structurés

## 📚 Documentation

- [`docs/architecture.md`](docs/architecture.md) — Diagrammes d'architecture détaillés
- [`docs/database-schema.md`](docs/database-schema.md) — Modèle conceptuel de données (MCD)
- [`docs/api-documentation.md`](docs/api-documentation.md) — Spécification de l'API
- [`docs/deployment.md`](docs/deployment.md) — Guide de déploiement

## 🎓 Contexte académique

Ce projet est réalisé dans le cadre d'un **stage**. Il vise à démontrer la maîtrise de :

- L'architecture en couches (présentation / métier / données)
- Le développement full-stack moderne (React + Node.js + PostgreSQL)
- La modélisation de données relationnelles
- Les bonnes pratiques de sécurité (auth, rate-limit, validation, hash)
- L'intégration de services tiers (Brevo, Render, Supabase)
- La documentation technique et la communication avec un jury

## 👨‍💻 Auteur

**Benroubi Car** — Étudiant en fin d'études, Oujda, Maroc.

## 📄 Licence

ISC — Usage académique et professionnel.
