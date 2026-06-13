import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174, // différent du frontend pour pouvoir lancer les 2 en parallèle
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
