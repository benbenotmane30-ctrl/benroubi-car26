# Benroubi Car — Frontend

Site public de l'application Benroubi Car (catalogue + réservation).

## 🛠️ Stack

- **Framework** : React 19
- **Bundler** : Vite 8
- **Langage** : TypeScript
- **Styling** : Tailwind CSS v4
- **Router** : React Router 7
- **HTTP** : Axios

## 📁 Structure

```
src/
├── components/    # Composants réutilisables (Header, CarCard, BookingForm…)
├── pages/         # Pages routées (HomePage, CatalogPage…)
├── hooks/         # Custom React hooks (useCars, useSeason…)
├── services/      # Couches d'appels API (cars.service.ts…)
├── contexts/      # Contexts React (Theme, Language…)
├── utils/         # Utilitaires (pricing, compression, format…)
├── types/         # Types TypeScript partagés
├── styles/        # CSS additionnel si besoin
├── App.tsx        # Configuration Router
├── main.tsx       # Point d'entrée React
└── index.css      # CSS global + tokens Tailwind
```

## 🚀 Démarrage

```bash
npm install
npm run dev      # http://localhost:5173
```

## 📋 Scripts

| Commande         | Description                          |
|------------------|--------------------------------------|
| `npm run dev`    | Serveur dev avec hot-reload          |
| `npm run build`  | Build production dans `dist/`        |
| `npm run preview`| Sert le build pour test local        |
| `npm run lint`   | Vérifie le code avec ESLint          |
