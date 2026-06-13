/**
 * Client Prisma singleton — un seul instance partagée par toute l'application.
 *
 * Pourquoi un singleton ? Chaque PrismaClient ouvre un pool de connexions.
 * Si on en créait un par fichier, on saturerait rapidement la limite de Postgres.
 */

import { PrismaClient } from '@prisma/client';

const isDev = process.env.NODE_ENV !== 'production';

export const prisma = new PrismaClient({
  log: isDev ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

// Déconnexion propre lors de l'arrêt du process
process.on('beforeExit', () => {
  void prisma.$disconnect();
});
