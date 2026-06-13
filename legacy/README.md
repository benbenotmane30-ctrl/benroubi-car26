# 🚗 Benroubi Car — Back-end Node.js

## Ce que fait ce serveur
- Reçoit les demandes de réservation depuis le site
- Envoie un e-mail complet à **benroubicar@yahoo.fr** avec les infos du client + le permis en pièce jointe
- Envoie un e-mail de confirmation automatique au client
- Reçoit les messages de contact

---

## 🚀 Déploiement sur Render (gratuit) — Étape par étape

### ÉTAPE 1 — Créer un compte Gmail dédié

1. Allez sur **gmail.com** et créez un compte dédié
   - Ex: `benroubi.car.notifications@gmail.com`
2. Une fois connecté, allez dans **Paramètres Google** → **Sécurité**
3. Activez la **Validation en deux étapes** (obligatoire)
4. Cherchez **"Mots de passe des applications"**
5. Créez un mot de passe pour "Autre application" → nommez-le "Benroubi Car"
6. **Copiez le mot de passe** affiché (format: `xxxx xxxx xxxx xxxx`)

---

### ÉTAPE 2 — Mettre le code sur GitHub

1. Créez un compte sur **github.com**
2. Cliquez **"New repository"** → nommez-le `benroubi-car-backend`
3. Cochez **"Private"** (privé — plus sécurisé)
4. Téléchargez les fichiers de ce dossier dans le repo :
   - `server.js`
   - `package.json`
   - `.gitignore`
   - `.env.example`
   
   ⚠️ **Ne mettez JAMAIS le fichier `.env` sur GitHub !**

---

### ÉTAPE 3 — Déployer sur Render

1. Allez sur **render.com** et créez un compte gratuit
2. Cliquez **"New +"** → **"Web Service"**
3. Connectez votre compte GitHub et sélectionnez `benroubi-car-backend`
4. Configurez :
   - **Name** : `benroubi-car-api`
   - **Region** : `Frankfurt (EU Central)` (plus proche du Maroc)
   - **Branch** : `main`
   - **Runtime** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`
   - **Plan** : `Free`

5. Dans la section **"Environment Variables"**, ajoutez :

| Clé | Valeur |
|-----|--------|
| `GMAIL_USER` | `benroubi.car.notifications@gmail.com` |
| `GMAIL_APP_PASSWORD` | `xxxx xxxx xxxx xxxx` (votre mot de passe d'app) |
| `DEST_EMAIL` | `benroubicar@yahoo.fr` |
| `FRONTEND_URL` | `*` (ou l'URL de votre site) |

6. Cliquez **"Create Web Service"**
7. Attendez 2-3 minutes que le déploiement se termine
8. **Copiez l'URL** donnée par Render (ex: `https://benroubi-car-api.onrender.com`)

---

### ÉTAPE 4 — Connecter le site front-end

Dans le fichier `location-voitures.html`, remplacez :

```javascript
const API_URL = 'https://benroubi-car-api.onrender.com';
```

C'est tout ! Les formulaires enverront automatiquement les données à votre serveur.

---

## 📡 Routes disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/booking` | Demande de réservation |
| `POST` | `/api/contact` | Formulaire de contact |

### Exemple — Demande de réservation
```
POST /api/booking
Content-Type: multipart/form-data

vehicle  : "Volkswagen Tiguan"
prenom   : "Mohammed"
nom      : "Alami"
email    : "m.alami@gmail.com"
tel      : "+212 6 12 34 56 78"
debut    : "2025-07-01"
fin      : "2025-07-10"
saison   : "Haute saison"
total    : "9000"
jours    : "9"
permis   : [fichier image/pdf]
```

---

## ⚠️ Notes importantes

- Sur Render **plan gratuit**, le serveur "s'endort" après 15 min d'inactivité
- Le premier e-mail après une inactivité peut prendre 30-50 secondes (réveil du serveur)
- Pour éviter ça → **Render Starter ($7/mois)** ou utiliser un service de ping automatique (UptimeRobot gratuit)

---

## 🔧 Test local

```bash
# Installer les dépendances
npm install

# Copier .env.example en .env et remplir les valeurs
cp .env.example .env

# Lancer le serveur
npm run dev

# Tester
curl http://localhost:3000/
```
