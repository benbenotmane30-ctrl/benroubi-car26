/** Types partagés admin — alignés sur le backend/frontend. */

// ─── Users / Auth ────────────────────────────────
export type Role = 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  active: boolean;
  phone: string | null;
  whatsappApiKey: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Forme abrégée du user retournée par /api/auth/login. */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface UsersApiResponse extends ApiResponse {
  users: User[];
  count: number;
}

// ─── Audit ───────────────────────────────────────
export interface AuditLog {
  id:        number;
  userId:    number | null;
  username:  string | null;
  action:    string;
  entity:    string | null;
  entityId:  number | null;
  details:   string | null;  // JSON sérialisé
  ipAddress: string | null;
  createdAt: string;
  user?: {
    id:        number;
    username:  string;
    firstName: string;
    lastName:  string;
    role:      Role;
  } | null;
}

export interface AuditApiResponse extends ApiResponse {
  logs:   AuditLog[];
  total:  number;
  limit:  number;
  offset: number;
}

// ─── Cars (existants) ────────────────────────────
export type CarCategory = 'citadine' | 'berline' | 'suv' | 'utilitaire' | 'premium';

export interface Car {
  id: number;
  name: string;
  category: CarCategory;
  badge?: string;
  carburant: string;
  boite: string;
  places: number | string;
  prix_haut: number;
  prix_bas: number;
  desc?: string;
  photos?: string[];
  dispo: boolean;
  marque?: string;
  modele?: string;
  annee?: string;
  matricule?: string;
  updatedAt?: number;
}

// ─── Insurance ───────────────────────────────────
// Saisie libre : matricule/marque/modele tapés à la main (pas de FK requise vers Car)
export interface Insurance {
  id:           number;
  matricule:    string;
  marque:       string;
  modele:       string;
  carId:        number | null;
  compagnie:    string;
  dateDebut:    string;  // ISO date
  dateFin:      string;
  montantMad:   number | null;
  notes:        string | null;
  alertSentAt:  string | null;
  createdAt:    string;
  updatedAt:    string;
}

export interface InsurancesApiResponse extends ApiResponse {
  insurances: Insurance[];
  count: number;
}

// ─── Visite Technique ────────────────────────────
export type ResultatVT = 'Favorable' | 'Défavorable' | 'Contre-visite';

export interface VisiteTechnique {
  id:             number;
  matricule:      string;
  marque:         string;
  modele:         string;
  carId:          number | null;
  centre:         string;
  dateVisite:     string;   // ISO date
  dateExpiration: string;
  resultat:       string | null;
  notes:          string | null;
  alertSentAt:    string | null;
  createdAt:      string;
  updatedAt:      string;
}

export interface VisitesApiResponse extends ApiResponse {
  visites: VisiteTechnique[];
  count: number;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface LoginResponse extends ApiResponse {
  token?: string;
  expiresAt?: number;
  user?: AuthUser;
}

export interface CarsApiResponse extends ApiResponse {
  cars: Car[];
  count: number;
  cloudEnabled: boolean;
  updatedAt: number | null;
}
