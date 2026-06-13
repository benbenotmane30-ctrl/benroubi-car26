/**
 * Service Upstash Redis — Stockage cloud des voitures.
 *
 * NOTE : ce service sera remplacé par Prisma + PostgreSQL en Phase 3.
 * Pour l'instant on garde Upstash pour ne rien casser pendant la migration.
 */

import type { Car } from '../types/index.js';

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL   ?? '';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? '';

const CARS_KEY    = 'bc:cars';
const CARS_TS_KEY = 'bc:cars:updatedAt';

export const MAX_CLOUD_SIZE_BYTES = 900_000; // marge sous la limite Upstash de 1 MB

export function isUpstashConfigured(): boolean {
  return !!(UPSTASH_URL && UPSTASH_TOKEN);
}

export function logUpstashConfig(): void {
  console.log('☁️  Upstash Redis :');
  console.log('   - URL   :', UPSTASH_URL   ? 'OK' : '❌ MANQUANT');
  console.log('   - TOKEN :', UPSTASH_TOKEN ? 'OK' : '❌ MANQUANT');
}

// ─── Helpers bas niveau ─────────────────────────────────────
async function upstashGet(key: string): Promise<string | null> {
  if (!isUpstashConfigured()) throw new Error('Upstash non configuré');
  const r = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`Upstash GET HTTP ${r.status}: ${txt.slice(0, 200)}`);
  }
  const data = (await r.json()) as { result: string | null };
  return data.result;
}

async function upstashSet(key: string, value: string): Promise<unknown> {
  if (!isUpstashConfigured()) throw new Error('Upstash non configuré');
  const r = await fetch(`${UPSTASH_URL}/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', key, value]),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`Upstash SET HTTP ${r.status}: ${txt.slice(0, 200)}`);
  }
  return r.json();
}

// ─── API publique du service ────────────────────────────────

export interface CarsSnapshot {
  cars: Car[];
  updatedAt: number | null;
}

/** Lit le snapshot complet des voitures depuis Upstash. */
export async function getCars(): Promise<CarsSnapshot> {
  const [raw, ts] = await Promise.all([
    upstashGet(CARS_KEY).catch(() => null),
    upstashGet(CARS_TS_KEY).catch(() => null),
  ]);
  const cars = raw ? (JSON.parse(raw) as Car[]) : [];
  const updatedAt = ts ? parseInt(ts, 10) || null : null;
  return { cars, updatedAt };
}

/**
 * Sauvegarde la liste complète des voitures dans Upstash.
 * Les photos sont retirées au préalable (trop volumineuses pour le plan gratuit).
 * Retourne { count, sizeBytes, updatedAt } ou jette une erreur si la taille dépasse la limite.
 */
export async function saveCars(cars: Car[]): Promise<{ count: number; sizeBytes: number; updatedAt: number }> {
  // Photos retirées
  const stripped = cars.map(({ photos: _photos, ...rest }) => rest);
  const json = JSON.stringify(stripped);
  if (json.length > MAX_CLOUD_SIZE_BYTES) {
    const err = new Error(
      `Données trop volumineuses (${Math.round(json.length/1024)} KB > ${Math.round(MAX_CLOUD_SIZE_BYTES/1024)} KB)`
    );
    (err as Error & { code: string }).code = 'PAYLOAD_TOO_LARGE';
    throw err;
  }
  const now = Date.now();
  await Promise.all([
    upstashSet(CARS_KEY, json),
    upstashSet(CARS_TS_KEY, String(now)),
  ]);
  return { count: stripped.length, sizeBytes: json.length, updatedAt: now };
}
