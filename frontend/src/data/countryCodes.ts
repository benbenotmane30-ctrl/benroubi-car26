/**
 * Liste d'indicatifs téléphoniques internationaux.
 * Ordre : marché principal de l'agence (Maroc + Maghreb + Europe + Golfe).
 *
 * Le champ `iso` est le code ISO 3166-1 alpha-2 (minuscules) utilisé pour
 * charger le drapeau SVG depuis https://flagcdn.com.
 */

export interface CountryCode {
  code: string;   // ex: '+212'
  iso:  string;   // ex: 'ma'  (lowercase ISO 3166-1)
  name: string;   // libellé français
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+212', iso: 'ma', name: 'Maroc' },
  { code: '+33',  iso: 'fr', name: 'France' },
  { code: '+34',  iso: 'es', name: 'Espagne' },
  { code: '+32',  iso: 'be', name: 'Belgique' },
  { code: '+213', iso: 'dz', name: 'Algérie' },
  { code: '+216', iso: 'tn', name: 'Tunisie' },
  { code: '+39',  iso: 'it', name: 'Italie' },
  { code: '+49',  iso: 'de', name: 'Allemagne' },
  { code: '+44',  iso: 'gb', name: 'Royaume-Uni' },
  { code: '+31',  iso: 'nl', name: 'Pays-Bas' },
  { code: '+41',  iso: 'ch', name: 'Suisse' },
  { code: '+351', iso: 'pt', name: 'Portugal' },
  { code: '+1',   iso: 'us', name: 'États-Unis / Canada' },
  { code: '+971', iso: 'ae', name: 'Émirats Arabes Unis' },
  { code: '+966', iso: 'sa', name: 'Arabie Saoudite' },
  { code: '+90',  iso: 'tr', name: 'Turquie' },
  { code: '+20',  iso: 'eg', name: 'Égypte' },
  { code: '+221', iso: 'sn', name: 'Sénégal' },
];

export const DEFAULT_COUNTRY_CODE = '+212';

/** URL du drapeau SVG via flagcdn.com (CDN gratuit, mise en cache automatique). */
export function flagUrl(iso: string): string {
  return `https://flagcdn.com/${iso}.svg`;
}
