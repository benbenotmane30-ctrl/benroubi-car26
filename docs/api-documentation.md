# Documentation API REST — Benroubi Car

> Base URL en dev : **`http://localhost:3000`**
> Format : **JSON** (request + response)
> Auth : **Bearer token** dans header `Authorization` pour les routes admin

## Convention de réponse

Toutes les réponses suivent ce format :

```json
{
  "success": true,
  "message": "...",         // optionnel
  "data": { ... }            // ou champs spécifiques (cars, users, etc.)
}
```

En cas d'erreur :

```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

## Codes HTTP utilisés

| Code | Sens |
|------|------|
| 200 | OK |
| 201 | Created (POST) |
| 204 | No Content (preflight CORS) |
| 400 | Bad Request (validation) |
| 401 | Unauthorized (token manquant/invalide) |
| 403 | Forbidden (rôle insuffisant) |
| 404 | Not Found |
| 409 | Conflict (doublon, refus, ressource en état incompatible) |
| 422 | Unprocessable Entity (body malformé) |
| 429 | Too Many Requests (rate-limit) |
| 500 | Internal Server Error |

---

## 🌐 Endpoints publics (sans auth)

### `GET /` — Healthcheck

Renvoie le statut du service et la liste des endpoints.

**Response 200** :
```json
{
  "status": "ok",
  "service": "Benroubi Car API",
  "version": "3.0.0",
  "endpoints": ["GET /api/ping", "POST /api/auth/login", ...]
}
```

### `GET /api/ping`

Ping rapide (cold-start utile en prod).

**Response 200** :
```json
{ "ok": true, "time": 1718284800000 }
```

### `GET /api/cars` — Liste publique des voitures

**Response 200** :
```json
{
  "success": true,
  "cars": [
    {
      "id": 1,
      "name": "Peugeot 208 Hybrid",
      "marque": "Peugeot",
      "modele": "208 Hybrid",
      "category": "citadine",
      "badge": "Citadine",
      "carburant": "Essence",
      "boite": "Automatique",
      "places": 5,
      "prix_haut": 500,
      "prix_bas": 300,
      "desc": "Citadine hybride…",
      "photos": ["data:image/jpeg;base64,..."],
      "dispo": true,
      "matricule": "123456-A-7",
      "updatedAt": 1718284800000
    }
  ],
  "cloudEnabled": true,
  "updatedAt": 1718284800000,
  "count": 15
}
```

### `POST /api/bookings` — Créer une réservation

**Request body** :
```json
{
  "vehicle": "Peugeot 208 Hybrid",
  "prenom": "Ahmed",
  "nom": "Benali",
  "email": "ahmed@example.com",
  "tel": "+212600000000",
  "debut": "2026-07-15",
  "fin":   "2026-07-22",
  "lieu":  "Aéroport Oujda Angad",
  "saison": "haut",
  "total": "3500",
  "jours": "7",
  "notes": "Permis avec moi"
}
```

**Response 200** :
```json
{ "success": true, "message": "Réservation enregistrée. Vous recevrez une confirmation par email." }
```

### `POST /api/contact` — Formulaire de contact

**Request body** :
```json
{
  "nom":     "Ahmed Benali",
  "email":   "ahmed@example.com",
  "sujet":   "Devis location 2 semaines",
  "message": "Bonjour…"
}
```

**Response 200** :
```json
{ "success": true }
```

---

## 🔐 Endpoints d'authentification

### `POST /api/auth/login` — Connexion admin

**Request body** :
```json
{ "username": "Youssef", "password": "benroubi2025" }
```

**Response 200** :
```json
{
  "success": true,
  "token": "eyJpZCI6MSwidSI6InlvdXNzZWYiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJleHAiOjE3MTg...",
  "expiresAt": 1718373200000,
  "user": {
    "id": 1,
    "username": "youssef",
    "email": "benbenotmane30@gmail.com",
    "firstName": "Youssef",
    "lastName": "Benroubi",
    "role": "SUPER_ADMIN"
  }
}
```

**Response 401** (mauvais mdp ou compte inactif) :
```json
{ "success": false, "message": "Identifiants incorrects." }
```

Note : tentatives échouées loggées dans `audit_logs`.

### `GET /api/auth/verify` — Vérifier la validité d'un token

**Header** : `Authorization: Bearer <token>`

**Response 200** :
```json
{ "success": true, "user": "youssef", "role": "SUPER_ADMIN", "expiresAt": 1718373200000 }
```

---

## 👤 Endpoints `/api/admin/me` (tout admin authentifié)

Tous nécessitent `Authorization: Bearer <token>`.

### `GET /api/admin/me` — Profil de l'utilisateur connecté

**Response 200** :
```json
{
  "success": true,
  "user": {
    "id": 1, "username": "youssef", "email": "...",
    "firstName": "Youssef", "lastName": "Benroubi",
    "role": "SUPER_ADMIN", "active": true,
    "phone": null, "whatsappApiKey": null,
    "lastLoginAt": "2026-06-13T08:00:00Z",
    "createdAt": "...", "updatedAt": "..."
  }
}
```

### `PUT /api/admin/me` — Modifier son propre profil

**Body** : `email?`, `firstName?`, `lastName?`, `phone?`, `whatsappApiKey?`

**Response 200** : `{ "success": true, "user": {...} }`

### `PUT /api/admin/me/password` — Changer son mot de passe

**Body** :
```json
{ "oldPassword": "ancien", "newPassword": "nouveau1234" }
```

**Response 200/401** : succès ou "Ancien mot de passe incorrect."

### `POST /api/admin/me/whatsapp-test` — Tester l'envoi WhatsApp (CallMeBot)

Nécessite `phone` + `whatsappApiKey` configurés dans le profil.

**Response 200** : `{ "success": true, "message": "Message envoyé sur WhatsApp." }`

---

## 👥 Endpoints `/api/admin/users` (Super Admin uniquement)

### `GET /api/admin/users` — Liste de tous les comptes

**Response 200** :
```json
{ "success": true, "users": [...], "count": 2 }
```

### `POST /api/admin/users` — Créer un compte

**Body** :
```json
{
  "username":  "ahmed",
  "email":     "ahmed@agence.fr",
  "password":  "secret123",
  "firstName": "Ahmed",
  "lastName":  "Bouazza",
  "role":      "ADMIN"
}
```

**Response 201** : `{ "success": true, "user": {...} }`

### `PUT /api/admin/users/:id` — Modifier un compte

**Body** (tous optionnels) : `email`, `password`, `firstName`, `lastName`, `role`, `active`, `phone`, `whatsappApiKey`

**Réponse 409** si on tente de se désactiver/rétrograder soi-même.

### `DELETE /api/admin/users/:id` — Supprimer un compte

**Réponse 409** si l'ID = celui du Super Admin connecté.

---

## 🚗 Endpoint admin pour les voitures

### `PUT /api/admin/cars` — Synchronisation complète du catalogue

Utilisé par le dashboard admin pour pusher l'état complet du catalogue (stratégie hybride localStorage → cloud).

**Body** :
```json
{
  "cars": [ { "id": 1, "name": "...", ... }, ... ],
  "confirmEmpty": true        // OPTIONNEL — requis si cars est vide
}
```

**Response 200** : `{ "success": true, "count": 15, "updatedAt": ... }`

**Response 409** si `cars: []` sans `confirmEmpty: true` (protection anti-wipe).

---

## 📋 Endpoints `/api/admin/audit` (Super Admin)

### `GET /api/admin/audit` — Lister les entrées du journal

**Query params** :
- `limit` (default 100, max 500)
- `offset` (default 0)
- `userId` — filtre sur un user
- `action` — filtre partiel sur l'action (ex: `auth.`)
- `fromDate`, `toDate` — ISO dates

**Response 200** :
```json
{
  "success": true,
  "logs": [
    {
      "id": 1, "userId": 1, "username": "youssef",
      "action": "user.create", "entity": "AdminUser", "entityId": 2,
      "details": "{\"username\":\"demo\",...}",
      "ipAddress": "::1",
      "createdAt": "2026-06-13T08:00:00Z",
      "user": { "id": 1, "username": "youssef", ... }
    }
  ],
  "total": 1, "limit": 100, "offset": 0
}
```

### `DELETE /api/admin/audit` — Vider le journal (double confirmation)

**Body** : `{ "confirm": "VIDER" }`

---

## 🛡️ Endpoints `/api/admin/insurances` (tout admin authentifié)

### `GET /api/admin/insurances` — Liste

### `GET /api/admin/insurances/:id` — Détail

### `POST /api/admin/insurances` — Créer

**Body** :
```json
{
  "matricule":  "123456-A-7",
  "marque":     "Renault",
  "modele":     "Megane",
  "compagnie":  "AXA Maroc",
  "dateDebut":  "2026-01-01",
  "dateFin":    "2027-01-01",
  "montantMad": 4500,
  "notes":      "Couverture tous risques"
}
```

### `PUT /api/admin/insurances/:id` — Modifier

### `DELETE /api/admin/insurances/:id` — Supprimer

---

## 🔧 Endpoints `/api/admin/visites` (tout admin authentifié)

### `GET /api/admin/visites` — Liste

### `POST /api/admin/visites` — Créer

**Body** :
```json
{
  "matricule":      "123456-A-7",
  "marque":         "Renault",
  "modele":         "Megane",
  "centre":         "Norisko Oujda",
  "dateVisite":     "2026-06-01",
  "dateExpiration": "2027-06-01",
  "resultat":       "Favorable",
  "notes":          "RAS"
}
```

### `PUT /api/admin/visites/:id` — Modifier

### `DELETE /api/admin/visites/:id` — Supprimer

---

## 🔔 Endpoints `/api/admin/alerts`

### `POST /api/admin/alerts/run` — Déclencher manuellement le check d'échéances

(Tout admin authentifié)

**Response 200** :
```json
{
  "success": true,
  "result": {
    "insurancesFound": 1,
    "visitesFound":    1,
    "recipientCount":  2,
    "emailsSent":      2,
    "whatsappSent":    0,
    "errors":          []
  }
}
```

Le scan détecte tout `Insurance.dateFin` ou `VisiteTechnique.dateExpiration` ≤ now+7j et `alertSentAt = NULL`. Envoie un email récap unique par admin actif. Marque `alertSentAt = NOW` pour éviter les doublons.

Le cron quotidien à **8h00 (Africa/Casablanca)** exécute automatiquement la même logique.

### `POST /api/admin/alerts/reset` — Reset des flags d'alerte (Super Admin)

Remet `alertSentAt = NULL` sur toutes les `insurances` et `visites_techniques`. Utile pour les démos ou pour ré-tester.

**Response 200** : `{ "success": true, "insurances": 5, "visites": 3 }`

---

## ⚙️ Rate limiting

| Endpoint | Limite (dev) | Limite (prod) |
|----------|--------------|---------------|
| Tous `/api/*` | 2000 req / 15 min / IP | 300 req / 15 min / IP |
| `POST /api/auth/login` | 50 essais ratés / 15 min / IP | 15 essais ratés / 15 min / IP |

Réponse en cas de dépassement : **HTTP 429** + message JSON.

---

## CORS

En **dev**, le backend accepte n'importe quel `http://localhost:*`.

En **prod**, mettre `FRONTEND_URL` et `ADMIN_URL` dans le `.env` (CSV possible : `FRONTEND_URL=https://app.com,https://www.app.com`).

---

## Outils de test recommandés

- **Thunder Client** (extension VS Code) — pratique pour tester depuis l'éditeur
- **Postman** — collection à monter pour la soutenance
- **curl** ou **PowerShell `Invoke-WebRequest`** — pour scripter
