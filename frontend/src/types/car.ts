/**
 * Types partagés frontend ↔ backend pour les voitures.
 * Doivent matcher backend/src/types/index.ts (Car interface).
 */

export type CarCategory = 'citadine' | 'berline' | 'suv' | 'utilitaire' | 'premium';

export interface Car {
  id: number;
  name: string;
  category: CarCategory;
  badge?: string;
  carburant: string;
  boite: string;
  places: number;
  prix_haut: number;
  prix_bas: number;
  desc?: string;
  photos?: string[];
  dispo: boolean;
  marque?: string;
  modele?: string;
  annee?: string;
  updatedAt?: number;
}

export type Season = 'haut' | 'bas';

export interface PriceBreakdown {
  joursHaut: number;
  joursBas:  number;
  montantHaut: number;
  montantBas:  number;
  total: number;
  totalJours: number;
}

export interface BookingFormData {
  vehicle: string;
  prenom: string;
  nom: string;
  email: string;
  tel: string;
  debut: string;
  fin: string;
  lieu: string;
  lieu_retour: string;
  notes?: string;
  saison?: string;
  total?: string;
  jours?: string;
  permis_recto?: File;
  permis_verso?: File;
}

export interface ContactFormData {
  nom?: string;
  email: string;
  tel?: string;
  sujet?: string;
  message: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface CarsApiResponse extends ApiResponse {
  cars: Car[];
  count: number;
  cloudEnabled: boolean;
  updatedAt: number | null;
}
