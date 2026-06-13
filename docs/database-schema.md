# Schéma de base de données — Benroubi Car

> Source de vérité : [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma)
> SGBD : **PostgreSQL 15+** hébergé sur **Supabase**

## Vue d'ensemble — Diagramme entité-relation

```
┌─────────────┐                  ┌──────────────┐
│  AdminUser  │ 1 ──── N (audit) │  AuditLog    │
│             │ ─────────────────│              │
└─────────────┘                  └──────────────┘

┌─────────────┐
│     Car     │
│             │ 1 ──── N ┌──────────────┐
└──────┬──────┘ ─────────│   Booking    │
       │                 └──────────────┘
       │                 ┌──────────────┐
       │ 1 ──── N (FK?)  │  Insurance   │   (carId nullable — saisie libre)
       │ ────────────────│              │
       │                 └──────────────┘
       │                 ┌─────────────────────┐
       │ 1 ──── N (FK?)  │  VisiteTechnique    │
       │ ────────────────│                     │
       │                 └─────────────────────┘
```

## Énumérations

### `BookingStatus`
| Valeur | Description |
|--------|-------------|
| `PENDING` | En attente de confirmation par l'agence |
| `CONFIRMED` | Confirmée par l'agence |
| `CANCELLED` | Annulée par le client ou l'agence |
| `COMPLETED` | Location terminée (voiture rendue) |

### `Role`
| Valeur | Description |
|--------|-------------|
| `SUPER_ADMIN` | Tous les droits — gestion des comptes + accès au journal d'audit |
| `ADMIN` | Gestion voitures, réservations, assurances, visites techniques |

---

## Tables

### 1. `cars` — Catalogue des véhicules

| Colonne | Type SQL | Contrainte | Description |
|---------|----------|------------|-------------|
| `id` | `INTEGER` | PK, autoincrement | Identifiant unique |
| `name` | `TEXT` | NOT NULL | Nom affiché ("Peugeot 208 Hybrid") |
| `marque` | `TEXT` | NOT NULL | "Peugeot" |
| `modele` | `TEXT` | NOT NULL | "208 Hybrid" |
| `annee` | `TEXT` | NULL | "2023" |
| `matricule` | `TEXT` | UNIQUE, NULL | Plaque d'immatriculation |
| `category` | `TEXT` | NOT NULL | citadine \| berline \| suv \| utilitaire \| premium |
| `badge` | `TEXT` | NULL | Libellé d'affichage ("Citadine", "SUV Premium") |
| `carburant` | `TEXT` | NOT NULL | Essence \| Diesel \| Hybride \| Électrique \| GPL |
| `boite` | `TEXT` | NOT NULL | Manuelle \| Automatique |
| `places` | `INTEGER` | NOT NULL, default 5 | Nombre de places |
| `prix_haut` | `INTEGER` | NOT NULL | Prix haute saison (MAD/j) |
| `prix_bas` | `INTEGER` | NOT NULL | Prix basse saison (MAD/j) |
| `description` | `TEXT` | NULL | Description marketing longue |
| `photos` | `TEXT[]` | default `[]` | URLs ou data-URLs base64 |
| `dispo` | `BOOLEAN` | NOT NULL, default true | Disponible à la location |
| `created_at` | `TIMESTAMP` | NOT NULL, default NOW | |
| `updated_at` | `TIMESTAMP` | NOT NULL, auto-updated | |

**Index** : `category`, `dispo`

**Relations** :
- `bookings: Booking[]` (1-N)
- `insurances: Insurance[]` (1-N, FK optionnelle)
- `visites: VisiteTechnique[]` (1-N, FK optionnelle)

---

### 2. `bookings` — Réservations clients

| Colonne | Type SQL | Contrainte | Description |
|---------|----------|------------|-------------|
| `id` | `INTEGER` | PK, autoincrement | |
| `car_id` | `INTEGER` | FK → cars.id, NOT NULL | Voiture réservée |
| `customer_first_name` | `TEXT` | NOT NULL | Prénom client |
| `customer_last_name` | `TEXT` | NOT NULL | Nom client |
| `customer_email` | `TEXT` | NOT NULL | Email client |
| `customer_phone` | `TEXT` | NOT NULL | Téléphone client |
| `start_date` | `DATE` | NOT NULL | Début location |
| `end_date` | `DATE` | NOT NULL | Fin location |
| `pickup_place` | `TEXT` | NULL | Lieu de prise en charge |
| `notes` | `TEXT` | NULL | Notes additionnelles |
| `total_mad` | `INTEGER` | NULL | Montant total calculé (MAD) |
| `status` | `BookingStatus` | NOT NULL, default PENDING | |
| `created_at` | `TIMESTAMP` | default NOW | |
| `updated_at` | `TIMESTAMP` | auto-updated | |

**Index composé** : `(car_id, start_date, end_date)` — pour vérifier les conflits de réservation
**Index** : `status`

---

### 3. `admin_users` — Comptes administrateurs

| Colonne | Type SQL | Contrainte | Description |
|---------|----------|------------|-------------|
| `id` | `INTEGER` | PK, autoincrement | |
| `username` | `TEXT` | UNIQUE, NOT NULL | Identifiant de login |
| `email` | `TEXT` | UNIQUE, NOT NULL | Pour réception des notifications |
| `password_hash` | `TEXT` | NOT NULL | Hash bcrypt (60 chars) |
| `first_name` | `TEXT` | NOT NULL | |
| `last_name` | `TEXT` | NOT NULL | |
| `role` | `Role` | NOT NULL, default ADMIN | |
| `active` | `BOOLEAN` | NOT NULL, default true | Si false, login refusé |
| `phone` | `TEXT` | NULL | Numéro WhatsApp (format international) |
| `whatsapp_api_key` | `TEXT` | NULL | Clé API CallMeBot |
| `last_login_at` | `TIMESTAMP` | NULL | |
| `created_at` | `TIMESTAMP` | default NOW | |
| `updated_at` | `TIMESTAMP` | auto-updated | |

**Relations** :
- `auditLogs: AuditLog[]` (1-N, onDelete SET NULL)

---

### 4. `audit_logs` — Journal d'audit (Super Admin)

| Colonne | Type SQL | Contrainte | Description |
|---------|----------|------------|-------------|
| `id` | `INTEGER` | PK, autoincrement | |
| `user_id` | `INTEGER` | FK → admin_users.id (SET NULL), NULL | Auteur de l'action |
| `username` | `TEXT` | NULL | Capture du username (subsiste si user supprimé) |
| `action` | `TEXT` | NOT NULL | ex: `car.replaceAll`, `user.create`, `auth.login_failed` |
| `entity` | `TEXT` | NULL | ex: `Car`, `AdminUser`, `Insurance` |
| `entity_id` | `INTEGER` | NULL | ID de l'entité concernée |
| `details` | `TEXT` | NULL | JSON sérialisé des détails (changedFields, etc.) |
| `ip_address` | `TEXT` | NULL | IP de la requête |
| `created_at` | `TIMESTAMP` | default NOW | |

**Index** : `user_id`, `action`, `created_at`

**Actions trackées** :
- `car.replaceAll`, `car.clear`
- `user.create`, `user.update`, `user.delete`, `user.toggle_active`, `user.change_role`
- `insurance.create`, `insurance.update`, `insurance.delete`
- `visite.create`, `visite.update`, `visite.delete`
- `auth.login_failed` (avec raison : wrong_password / account_disabled / unknown_user)
- `alert.sent`

---

### 5. `insurances` — Polices d'assurance

> **Particularité** : saisie LIBRE. `matricule`, `marque`, `modele` sont stockés directement (pas de FK requise vers `cars`).
> Cela permet de gérer aussi les véhicules pas encore (ou jamais) dans le catalogue.
> Le lien `car_id` reste possible mais optionnel.

| Colonne | Type SQL | Contrainte | Description |
|---------|----------|------------|-------------|
| `id` | `INTEGER` | PK, autoincrement | |
| `matricule` | `TEXT` | NOT NULL | Plaque (saisie libre, normalisée en MAJUSCULES) |
| `marque` | `TEXT` | NOT NULL | Saisie libre |
| `modele` | `TEXT` | NOT NULL | Saisie libre |
| `car_id` | `INTEGER` | FK → cars.id (SET NULL), NULL | Lien optionnel vers catalogue |
| `compagnie` | `TEXT` | NOT NULL | ex: "AXA Maroc", "Wafa Assurance" |
| `date_debut` | `DATE` | NOT NULL | |
| `date_fin` | `DATE` | NOT NULL | ★ utilisée pour les alertes |
| `montant_mad` | `INTEGER` | NULL | Prime payée (MAD) |
| `notes` | `TEXT` | NULL | |
| `alert_sent_at` | `TIMESTAMP` | NULL | Anti-doublon d'alerte |
| `created_at` | `TIMESTAMP` | default NOW | |
| `updated_at` | `TIMESTAMP` | auto-updated | |

**Index** : `car_id`, `matricule`, `date_fin`

**Stratégie historique** : chaque renouvellement crée une nouvelle ligne. La police « courante » d'une voiture = celle avec `date_fin` la plus récente.

---

### 6. `visites_techniques` — Contrôles techniques

> Même particularité que `insurances` : saisie libre.

| Colonne | Type SQL | Contrainte | Description |
|---------|----------|------------|-------------|
| `id` | `INTEGER` | PK, autoincrement | |
| `matricule` | `TEXT` | NOT NULL | |
| `marque` | `TEXT` | NOT NULL | |
| `modele` | `TEXT` | NOT NULL | |
| `car_id` | `INTEGER` | FK → cars.id (SET NULL), NULL | |
| `centre` | `TEXT` | NOT NULL | ex: "Norisko Oujda", "DEKRA Maroc" |
| `date_visite` | `DATE` | NOT NULL | Date de la visite |
| `date_expiration` | `DATE` | NOT NULL | ★ utilisée pour les alertes |
| `resultat` | `TEXT` | NULL | "Favorable" \| "Défavorable" \| "Contre-visite" |
| `notes` | `TEXT` | NULL | |
| `alert_sent_at` | `TIMESTAMP` | NULL | |
| `created_at` | `TIMESTAMP` | default NOW | |
| `updated_at` | `TIMESTAMP` | auto-updated | |

**Index** : `car_id`, `matricule`, `date_expiration`

---

## Convention de nommage Prisma ↔ SQL

| Niveau | Convention | Exemple |
|--------|------------|---------|
| Modèle Prisma | **PascalCase** | `AdminUser`, `VisiteTechnique` |
| Champ Prisma (TS) | **camelCase** | `firstName`, `prixHaut`, `passwordHash` |
| Colonne SQL (mapping via `@map`) | **snake_case** | `first_name`, `prix_haut`, `password_hash` |
| Nom de table SQL (`@@map`) | **snake_case pluriel** | `admin_users`, `visites_techniques` |

Exemple :
```prisma
model AdminUser {
  passwordHash String @map("password_hash")
  @@map("admin_users")
}
```
→ Table SQL : `admin_users`, colonne : `password_hash`, code TS : `user.passwordHash`.

---

## Migrations Prisma

Le projet utilise `prisma db push` en développement (synchronisation directe sans fichier de migration formel). En production, basculer sur `prisma migrate deploy` :

```bash
# Dev (sync direct)
npx prisma db push --accept-data-loss

# Régénérer le client après modification du schema
npx prisma generate

# Production (futures migrations versionnées)
npx prisma migrate deploy
```

## Variables d'environnement

```env
# Pooler transaction (port 6543) — pour les requêtes app
DATABASE_URL="postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Pooler session (port 5432) — pour les migrations
DIRECT_URL="postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
```

> ⚠️ **Note importante** : avec pgbouncer en mode transaction, les longues transactions Prisma peuvent échouer ("Transaction not found"). La fonction `replaceAll` du repository cars utilise donc 3 étapes séparées (`deleteMany` + `createMany` + `setval`) plutôt qu'une transaction longue.

---

## Statistiques actuelles (au seed initial)

- 15 voitures par défaut (Peugeot 208, Volkswagen Tiguan, Dacia Duster, etc.)
- 1 Super Admin créé automatiquement au démarrage (depuis les variables `ADMIN_USER` + `ADMIN_PASS` du `.env`)
