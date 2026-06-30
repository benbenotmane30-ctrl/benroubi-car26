/**
 * Types TypeScript partagés à travers le backend.
 * Définit les contrats de données entre les couches (controllers, services, etc.).
 */

import type { Request } from 'express';

// ─── Voitures ───────────────────────────────────────
export type CarCategory = 'citadine' | 'berline' | 'suv' | 'utilitaire' | 'premium';
export type CarFuel     = 'Essence' | 'Diesel' | 'Hybride' | 'Électrique' | 'GPL';
export type CarGearbox  = 'Manuelle' | 'Automatique';

export interface Car {
  id: number;
  name: string;
  category: CarCategory;
  badge?: string;
  carburant: CarFuel | string;
  boite: CarGearbox | string;
  places: number | string;
  prix_haut: number;
  prix_bas: number;
  desc?: string;
  photos?: string[];
  dispo: boolean;
  marque?: string;
  modele?: string;
  annee?: string | number;
  matricule?: string;
  updatedAt?: number;
}

// ─── Auth ───────────────────────────────────────────
export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export interface AdminPayload {
  id: number;        // FK vers admin_users.id
  u: string;         // username
  role: AdminRole;   // ADMIN ou SUPER_ADMIN
  exp: number;       // expiration timestamp (ms)
  iat: number;       // issued-at timestamp (ms)
}

/** Augmentation du type Request d'Express pour ajouter req.admin */
declare module 'express-serve-static-core' {
  interface Request {
    admin?: AdminPayload;
  }
}

// ─── Réservation ────────────────────────────────────
export interface BookingPayload {
  vehicle: string;
  prenom: string;
  nom: string;
  email: string;
  tel: string;
  debut: string;       // YYYY-MM-DD
  fin: string;
  saison?: string;
  total?: string;
  jours?: string;
  lieu?: string;
  lieuRetour?: string;
  notes?: string;
}

// ─── Contact ────────────────────────────────────────
export interface ContactPayload {
  nom?: string;
  email: string;
  tel?: string;
  sujet?: string;
  message: string;
}

// ─── Email ──────────────────────────────────────────
export interface EmailAttachment {
  name: string;
  contentBase64: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

// ─── Réponses API standardisées ─────────────────────
export interface ApiSuccess<T = unknown> {
  success: true;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export interface ApiError {
  success: false;
  message: string;
  error?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// Re-export pour usage simple dans les controllers
export type { Request };
