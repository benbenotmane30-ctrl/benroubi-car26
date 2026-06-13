/**
 * Helpers de validation simples (sans Zod pour rester léger sur le PFE).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && EMAIL_RE.test(value);
}

/** Nettoie une chaîne pour usage dans un nom de fichier (alphanum + . _ - uniquement). */
export function safeFilename(s: string | undefined | null): string {
  return (s ?? '').toString().replace(/[^a-zA-Z0-9._-]/g, '_');
}

/** Extrait l'extension d'un nom de fichier (sans le point), avec fallback. */
export function getExtension(originalname: string | undefined, fallback = 'jpg'): string {
  if (!originalname || !originalname.includes('.')) return fallback;
  const ext = originalname.split('.').pop();
  return ext && ext.length > 0 ? ext : fallback;
}

/** Convertit un input quelconque en string trim ; renvoie une chaîne vide si null/undefined. */
export function asTrimmedString(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}
