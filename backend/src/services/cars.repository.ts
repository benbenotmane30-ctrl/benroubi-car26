/**
 * Cars Repository — Couche d'accès aux données pour les voitures.
 * Encapsule TOUTES les requêtes Prisma liées au model Car.
 *
 * Avantages de cette couche :
 *   - Les controllers ne dépendent pas de Prisma directement (testable, swappable)
 *   - Les mappings DB → API (anglais → français) sont centralisés
 *   - Le code reste DRY (don't repeat yourself)
 */

import { prisma } from './prisma.service.js';
import type { Car as DbCar } from '@prisma/client';
import type { Car as ApiCar } from '../types/index.js';

/**
 * Mappe une ligne Postgres (DbCar) vers l'objet attendu par l'API existante.
 * Permet de garder la rétrocompatibilité avec le front-end actuel.
 */
function dbToApi(c: DbCar): ApiCar {
  return {
    id:        c.id,
    name:      c.name,
    category:  c.category as ApiCar['category'],
    badge:     c.badge ?? undefined,
    carburant: c.carburant,
    boite:     c.boite,
    places:    c.places,
    prix_haut: c.prixHaut,
    prix_bas:  c.prixBas,
    desc:      c.description ?? undefined,
    photos:    c.photos ?? [],
    dispo:     c.dispo,
    marque:    c.marque,
    modele:    c.modele,
    annee:     c.annee ?? undefined,
    matricule: c.matricule ?? undefined,
    updatedAt: c.updatedAt.getTime(),
  };
}

/**
 * Mappe un objet API (français, à plat) vers un input Prisma pour create/update.
 */
function apiToDbInput(c: ApiCar): Omit<DbCar, 'id' | 'createdAt' | 'updatedAt'> & { id?: number } {
  return {
    id:          c.id,
    name:        c.name,
    marque:      c.marque ?? '',
    modele:      c.modele ?? '',
    annee:       c.annee != null ? String(c.annee) : null,
    matricule:   c.matricule?.trim() || null,
    category:    c.category,
    badge:       c.badge ?? null,
    carburant:   c.carburant,
    boite:       c.boite,
    places:      typeof c.places === 'string' ? parseInt(c.places, 10) || 5 : c.places,
    prixHaut:    c.prix_haut,
    prixBas:     c.prix_bas,
    description: c.desc ?? null,
    photos:      c.photos ?? [],
    dispo:       c.dispo,
  };
}

// ─── API publique du repository ───────────────────────────

export async function findAll(): Promise<ApiCar[]> {
  const cars = await prisma.car.findMany({ orderBy: { id: 'asc' } });
  return cars.map(dbToApi);
}

export async function findById(id: number): Promise<ApiCar | null> {
  const car = await prisma.car.findUnique({ where: { id } });
  return car ? dbToApi(car) : null;
}

export async function count(): Promise<number> {
  return prisma.car.count();
}

/**
 * Remplace l'intégralité du catalogue par la nouvelle liste fournie.
 * Utilisé par PUT /api/admin/cars pour rester rétrocompatible avec le front-end.
 *
 * Stratégie : 3 étapes séparées (pas de transaction longue).
 *   1. deleteMany bookings + cars (FK order)
 *   2. createMany cars en un seul INSERT batché (Postgres supporte les IDs explicites)
 *   3. setval pour ajuster la séquence d'autoincrement
 *
 * Pourquoi pas de transaction : Supabase pgbouncer (mode transaction, port 6543)
 * ferme la session entre les queries, ce qui invalide les transactions Prisma
 * longues. Avec deleteMany + createMany batché, on tient en 2-3 round-trips
 * rapides et on n'a plus besoin d'envelopper.
 */
export async function replaceAll(cars: ApiCar[]): Promise<{ count: number; updatedAt: number }> {
  const inputs = cars.map(apiToDbInput);

  // 1. Vide bookings (FK) puis cars
  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();

  if (inputs.length === 0) {
    return { count: 0, updatedAt: Date.now() };
  }

  // 2. Insère toutes les nouvelles voitures en un seul batch
  await prisma.car.createMany({ data: inputs });

  // 3. Ajuste la séquence pour pas qu'un futur INSERT écrase un id existant
  const maxId = Math.max(...inputs.map(i => i.id ?? 0));
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('cars', 'id'), GREATEST($1::int, 1))`,
    maxId,
  );

  return { count: inputs.length, updatedAt: Date.now() };
}

/** Crée une voiture (utilisé pour le seed initial et la future API POST). */
export async function create(car: Omit<ApiCar, 'id'>): Promise<ApiCar> {
  const input = apiToDbInput({ ...car, id: 0 });
  delete (input as { id?: number }).id;
  const created = await prisma.car.create({ data: input });
  return dbToApi(created);
}

/** Met à jour une voiture (utilisé pour la future API PUT /:id). */
export async function update(id: number, car: Partial<ApiCar>): Promise<ApiCar | null> {
  const data: Partial<ReturnType<typeof apiToDbInput>> = {};
  if (car.name      !== undefined) data.name        = car.name;
  if (car.marque    !== undefined) data.marque      = car.marque;
  if (car.modele    !== undefined) data.modele      = car.modele;
  if (car.annee     !== undefined) data.annee       = car.annee != null ? String(car.annee) : null;
  if (car.category  !== undefined) data.category    = car.category;
  if (car.badge     !== undefined) data.badge       = car.badge ?? null;
  if (car.carburant !== undefined) data.carburant   = car.carburant;
  if (car.boite     !== undefined) data.boite       = car.boite;
  if (car.places    !== undefined) {
    data.places = typeof car.places === 'string' ? parseInt(car.places, 10) || 5 : car.places;
  }
  if (car.prix_haut !== undefined) data.prixHaut    = car.prix_haut;
  if (car.prix_bas  !== undefined) data.prixBas     = car.prix_bas;
  if (car.desc      !== undefined) data.description = car.desc ?? null;
  if (car.photos    !== undefined) data.photos      = car.photos;
  if (car.dispo     !== undefined) data.dispo       = car.dispo;

  try {
    const updated = await prisma.car.update({ where: { id }, data });
    return dbToApi(updated);
  } catch {
    return null;
  }
}

/** Supprime une voiture par son ID. */
export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.car.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
