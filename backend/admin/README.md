# Benroubi Car — Admin Dashboard

Application d'administration de l'agence (gestion du catalogue, des réservations, etc.).

## 🛠️ Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4
- React Router 7
- Axios

## 📁 Structure

```
src/
├── components/    # Sidebar, Topbar, KPICard, DataTable, Drawer…
├── pages/         # LoginPage, DashboardPage, FleetPage, BackupPage…
├── hooks/         # useAuth, useCars, useToast…
├── services/      # api.ts, auth.service.ts, cars.service.ts…
├── contexts/      # AuthContext, ToastContext…
├── utils/         # crypto, format, validation…
├── types/         # Types TypeScript partagés
├── App.tsx        # Router avec routes protégées
├── main.tsx       # Point d'entrée
└── index.css      # Tailwind + tokens
```

## 🚀 Démarrage

```bash
npm install
npm run dev      # http://localhost:5174
```

L'admin tourne sur **le port 5174** pour pouvoir cohabiter avec le frontend (5173).

## 🔐 Sécurité

- Login via le backend (`/api/auth/login`)
- Token JWT signé HMAC-SHA256
- Auto-logout après 8h
- Rate-limit 8 essais / 15 min côté serveur

Voir [`backend/src/middleware/auth.middleware.ts`](../backend/src/middleware/auth.middleware.ts) pour la logique d'auth.
