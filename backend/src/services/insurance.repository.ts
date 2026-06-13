/**
 * Insurance Repository — CRUD pour les polices d'assurance.
 *
 * Saisie LIBRE : matricule/marque/modele sont stockés directement dans la table.
 * carId est optionnel (lien possible mais pas obligatoire vers Car).
 */

import { prisma } from './prisma.service.js';

export interface InsuranceRecord {
  id:           number;
  matricule:    string;
  marque:       string;
  modele:       string;
  carId:        number | null;
  compagnie:    string;
  dateDebut:    Date;
  dateFin:      Date;
  montantMad:   number | null;
  notes:        string | null;
  alertSentAt:  Date | null;
  createdAt:    Date;
  updatedAt:    Date;
}

export async function findAll(): Promise<InsuranceRecord[]> {
  return prisma.insurance.findMany({ orderBy: { dateFin: 'asc' } });
}

export async function findById(id: number): Promise<InsuranceRecord | null> {
  return prisma.insurance.findUnique({ where: { id } });
}

export async function findByMatricule(matricule: string): Promise<InsuranceRecord[]> {
  return prisma.insurance.findMany({
    where: { matricule: matricule.toUpperCase() },
    orderBy: { dateFin: 'desc' },
  });
}

export interface CreateInsuranceInput {
  matricule:    string;
  marque:       string;
  modele:       string;
  carId?:       number | null;
  compagnie:    string;
  dateDebut:    Date;
  dateFin:      Date;
  montantMad?:  number;
  notes?:       string;
}

export async function create(input: CreateInsuranceInput): Promise<InsuranceRecord> {
  return prisma.insurance.create({
    data: {
      matricule:    input.matricule.trim().toUpperCase(),
      marque:       input.marque.trim(),
      modele:       input.modele.trim(),
      carId:        input.carId ?? null,
      compagnie:    input.compagnie.trim(),
      dateDebut:    input.dateDebut,
      dateFin:      input.dateFin,
      montantMad:   input.montantMad ?? null,
      notes:        input.notes?.trim() || null,
    },
  });
}

export interface UpdateInsuranceInput {
  matricule?:    string;
  marque?:       string;
  modele?:       string;
  carId?:        number | null;
  compagnie?:    string;
  dateDebut?:    Date;
  dateFin?:      Date;
  montantMad?:   number | null;
  notes?:        string | null;
}

export async function update(id: number, input: UpdateInsuranceInput): Promise<InsuranceRecord | null> {
  try {
    const data: Record<string, unknown> = {};
    if (input.matricule  !== undefined) data.matricule  = input.matricule.trim().toUpperCase();
    if (input.marque     !== undefined) data.marque     = input.marque.trim();
    if (input.modele     !== undefined) data.modele     = input.modele.trim();
    if (input.carId      !== undefined) data.carId      = input.carId;
    if (input.compagnie  !== undefined) data.compagnie  = input.compagnie.trim();
    if (input.dateDebut  !== undefined) data.dateDebut  = input.dateDebut;
    if (input.dateFin    !== undefined) data.dateFin    = input.dateFin;
    if (input.montantMad !== undefined) data.montantMad = input.montantMad;
    if (input.notes      !== undefined) data.notes      = input.notes?.trim() || null;
    return await prisma.insurance.update({ where: { id }, data });
  } catch { return null; }
}

export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.insurance.delete({ where: { id } });
    return true;
  } catch { return false; }
}
