# Guide de déploiement — Benroubi Car

Ce guide explique comment déployer l'application en production sur des services **gratuits** (suffisants pour un PFE / petit business).

## Vue d'ensemble

| Composant | Service recommandé | Plan | URL finale (exemple) |
|-----------|--------------------|------|----------------------|
| **BDD PostgreSQL** | Supabase | Free (500 MB, illimité) | `*.supabase.co` |
| **Backend API** | Render | Free (sleep 15 min d'inactivité) | `benroubi-car-api.onrender.com` |
| **Frontend client** | Vercel | Hobby (illimité) | `benroubi-car.vercel.app` |
| **Admin dashboard** | Vercel | Hobby (illimité) | `benroubi-car-admin.vercel.app` |
| **Emails transactionnels** | Brevo | Free (300 emails/jour) | API HTTPS |
| **Domaine custom** *(optionnel)* | Namecheap / GoDaddy | ~10€/an | `benroubi-car.ma` |

---

## 1. BDD — Supabase (déjà actif)

La BDD est déjà hébergée sur Supabase. Aucune action requise sauf si tu veux en créer une nouvelle pour la prod.

### Récupérer l'URL de connexion

1. Va sur **https://app.supabase.com**
2. Sélectionne ton projet
3. **Settings → Database → Connection string**
4. Choisis **Transaction (port 6543)** pour `DATABASE_URL`
5. Choisis **Session (port 5432)** pour `DIRECT_URL`

```env
DATABASE_URL="postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
```

---

## 2. Backend API — Render

### Étape 1 — Créer un compte
- Va sur **https://render.com/**
- Inscris-toi avec ton compte GitHub (gratuit)

### Étape 2 — Créer un Web Service
1. Dashboard → **New** → **Web Service**
2. Connecte ton repo GitHub (`benroubi-car26` ou autre)
3. Configure :

| Champ | Valeur |
|-------|--------|
| **Name** | `benroubi-car-api` |
| **Region** | Frankfurt (proche du Maroc) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `node dist/server.js` |
| **Plan** | Free |

### Étape 3 — Variables d'environnement

Dans **Environment** → **Add Environment Variable** :

```env
# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://benroubi-car.vercel.app
ADMIN_URL=https://benroubi-car-admin.vercel.app

# BDD
DATABASE_URL=<copie depuis Supabase>
DIRECT_URL=<copie depuis Supabase>

# Auth
ADMIN_USER=Youssef
ADMIN_PASS=benroubi2025
ADMIN_PASS_HASH=0efb89ef5361d2d06c85d1d2b2ca8fec61e62ca51e1d3a15300e126dbc44f2e1
SESSION_SECRET=<utilise une chaîne aléatoire forte, ex: openssl rand -hex 48>
SESSION_TTL_HOURS=8

# Seed Super Admin
SUPERADMIN_EMAIL=benbenotmane30@gmail.com
SUPERADMIN_FIRSTNAME=Youssef
SUPERADMIN_LASTNAME=Benroubi

# Brevo
BREVO_API_KEY=xkeysib-...        # Ta vraie clé
SENDER_EMAIL=benbenotmane30@gmail.com
SENDER_NAME=Benroubi Car
DEST_EMAIL=benroubicar@yahoo.fr
```

### Étape 4 — Build script

Vérifie que `backend/package.json` contient :

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Étape 5 — Déployer

Render va lancer le build automatiquement. Suis les logs jusqu'au message :

```
🚀 Benroubi Car API — Port 3000
```

L'URL finale ressemble à : `https://benroubi-car-api.onrender.com`

> ⚠️ **Limite plan Free** : le serveur s'endort après **15 minutes d'inactivité**. Le 1er appel après mise en veille prend ~30s (cold start). Pour le PFE c'est acceptable.
> Solution palliative : Render plan **Starter $7/mois** = toujours actif.

---

## 3. Frontend client — Vercel

### Étape 1 — Créer un compte
- Va sur **https://vercel.com/**
- Sign in avec GitHub

### Étape 2 — Importer le projet
1. Dashboard → **Add New** → **Project**
2. Sélectionne ton repo `benroubi-car26`
3. **Import**
4. Configure :

| Champ | Valeur |
|-------|--------|
| **Project Name** | `benroubi-car` |
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` *(clique Edit)* |
| **Build Command** | `npm run build` *(auto)* |
| **Output Directory** | `dist` *(auto)* |
| **Install Command** | `npm install` *(auto)* |

### Étape 3 — Variables d'environnement

Section **Environment Variables** :

```env
VITE_API_URL=https://benroubi-car-api.onrender.com
```

### Étape 4 — Deploy

Clique **Deploy**. Vercel build et déploie en ~2 minutes.

URL finale : `https://benroubi-car.vercel.app`

---

## 4. Admin dashboard — Vercel

Même procédure que le frontend, mais avec un autre projet :

| Champ | Valeur |
|-------|--------|
| **Project Name** | `benroubi-car-admin` |
| **Root Directory** | `backend/admin` |

Variable d'env identique :
```env
VITE_API_URL=https://benroubi-car-api.onrender.com
```

URL finale : `https://benroubi-car-admin.vercel.app`

---

## 5. Mise à jour CORS du backend

Une fois les URL Vercel obtenues, **retourne sur Render** → ton Web Service → Environment → modifie :

```env
FRONTEND_URL=https://benroubi-car.vercel.app
ADMIN_URL=https://benroubi-car-admin.vercel.app
```

Sauvegarde → Render redéploie automatiquement (~1 min).

---

## 6. Domaine personnalisé *(optionnel, ~10€/an)*

### Achat
- Namecheap, GoDaddy, OVH… pour un `.ma`, regarder chez maroctelecom (~50 MAD/an).

### Configuration DNS pour Vercel
1. Vercel → ton projet → **Settings** → **Domains**
2. Ajoute `benroubi-car.ma` (ou ton domaine)
3. Vercel te donne 2 valeurs : un **A record** + un **CNAME record**
4. Va chez ton registrar (zone DNS) → ajoute les enregistrements donnés par Vercel
5. Attendre la propagation DNS (5 min à 24h)

### Configuration DNS pour Render (sous-domaine)
1. Render → ton service → **Settings** → **Custom Domain**
2. Ajoute `api.benroubi-car.ma`
3. Ajoute le CNAME donné par Render dans ta zone DNS

Une fois en place, mets à jour les variables d'env Vercel :
```env
VITE_API_URL=https://api.benroubi-car.ma
```

---

## 7. Checklist pré-déploiement

Avant de déployer en prod, vérifie :

- [ ] Tous les `.env` sont dans le `.gitignore` (pas commités)
- [ ] Les clés/secrets en prod sont **différents** de ceux du dev (notamment `SESSION_SECRET`)
- [ ] `NODE_ENV=production` côté Render (active les limites de rate-limit strictes)
- [ ] La BDD Supabase a bien les bonnes tables (`npx prisma db push` une fois en local pointant vers la prod si besoin)
- [ ] Le `SUPERADMIN_*` du `.env` correspond à un email accessible
- [ ] Le compte Brevo a pas d'IP restriction côté sandbox
- [ ] Email `SENDER_EMAIL` est vérifié dans Brevo
- [ ] Test du flux complet : login admin → modif voiture → vérif côté site client → réservation → email reçu

---

## 8. Mises à jour ultérieures

### Déclenchement automatique sur git push
Render et Vercel sont liés à GitHub. Chaque `git push origin main` déclenche un redéploiement automatique des 3 services.

### Workflow recommandé
```bash
# Travail en local sur une branche
git checkout -b feature/nouvelle-fonction
# ... code ...
git commit -m "Add..."
git push origin feature/nouvelle-fonction

# Quand prêt, merge sur main
git checkout main
git merge feature/nouvelle-fonction
git push origin main          # → déclenche les déploiements
```

---

## 9. Surveillance et logs

| Service | Logs en temps réel |
|---------|---------------------|
| Render | Dashboard → ton service → **Logs** |
| Vercel | Dashboard → ton projet → **Deployments** → clic sur un build |
| Supabase | Dashboard → **Database** → **Logs** |
| Brevo | Dashboard → **Statistics** → **Email log** |

---

## 10. Coûts estimés (plans gratuits suffisants pour le PFE)

| Service | Coût mensuel |
|---------|--------------|
| Supabase Free | **0 €** |
| Render Free | **0 €** (sleep) |
| Vercel Hobby | **0 €** |
| Brevo Free | **0 €** (300 emails/jour) |
| Domaine `.ma` *(optionnel)* | ~50 MAD/an |
| **Total** | **0 € à 1 €/mois** |

Pour passer en plan payant (toujours actif, plus de stockage) :
- Render Starter : $7/mois
- Vercel Pro : $20/mois (probablement inutile)
- Supabase Pro : $25/mois (probablement inutile)

---

## 11. Restauration BDD en cas de problème

Si ta BDD Supabase est vide ou corrompue :

```bash
# 1. Connecte-toi au repo
cd backend

# 2. Push le schema
npx prisma db push --accept-data-loss

# 3. Le seed Super Admin se relance automatiquement au prochain boot du backend
# 4. Les voitures peuvent être restaurées depuis un backup JSON via la page Sauvegarde du dashboard
```

---

## 12. Questions fréquentes

**Q : Render dort, comment l'éviter ?**
R : Pour le PFE, l'avertir le jury que le 1er appel met 30s. Ou souscrire au plan Starter $7/mois.

**Q : Mes emails Brevo n'arrivent pas en prod**
R : Vérifier que ton IP Render est autorisée chez Brevo (Sécurité → IPs autorisées → "Désactiver pour l'API" si problème).

**Q : Erreur CORS en prod**
R : Vérifier que `FRONTEND_URL` et `ADMIN_URL` correspondent **exactement** aux URL Vercel (pas de `/` final, https://, etc.).

**Q : Comment déployer une migration BDD ?**
R : Pour l'instant on utilise `db push` (dev). Pour de vraies migrations versionnées :
```bash
npx prisma migrate dev --name nom_migration   # crée la migration
git push                                       # push sur main
# Render lance "npx prisma migrate deploy" automatiquement si dans le build command
```
