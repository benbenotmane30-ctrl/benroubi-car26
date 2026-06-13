/**
 * Visite Technique Repository — CRUD pour les contrôles techniques.
 * Saisie LIBRE : matricule/marque/modele tapés à la main.
 */

import { prisma } from './prisma.service.js';

export type ResultatVT = 'Favorable' | 'Défavorable' | 'Contre-visite';

export interface VisiteRecord {
  id:             number;
  matricule:      string;
  marque:         string;
  modele:         string;
  carId:          number | null;
  centre:         string;
  dateVisite:     Date;
  dateExpiration: Date;
  resultat:       string | null;
  notes:          string | null;
  alertSentAt:    Date | null;
  createdAt:      Date;
  updatedAt:      Date;
}

export async function findAll(): Promise<VisiteRecord[]> {
  return prisma.visiteTechnique.findMany({ orderBy: { dateExpiration: 'asc' } });
}

export async function findById(id: number): Promise<VisiteRecord | null> {
  return prisma.visiteTechnique.findUnique({ where: { id } });
}

export interface CreateVisiteInput {
  matricule:      string;
  marque:         string;
  modele:         string;
  carId?:         number | null;
  centre:         string;
  dateVisite:     Date;
  dateExpiration: Date;
  resultat?:      string;
  notes?:         string;
}

export async function create(input: CreateVisiteInput): Promise<VisiteRecord> {
  return prisma.visiteTechnique.create({
    data: {
      matricule:      input.matricule.trim().toUpperCase(),
      marque:         input.marque.trim(),
      modele:         input.modele.trim(),
      carId:          input.carId ?? null,
      centre:         input.centre.trim(),
      dateVisite:     input.dateVisite,
      dateExpiration: input.dateExpiration,
      resultat:       input.resultat?.trim() || null,
      notes:          input.notes?.trim() || null,
    },
  });
}

export interface UpdateVisiteInput {
  matricule?:      string;
  marque?:         string;
  modele?:         string;
  carId?:          number | null;
  centre?:         string;
  dateVisite?:     Date;
  dateExpiration?: Date;
  resultat?:       string | null;
  notes?:          string | null;
}

export async function update(id: number, input: UpdateVisiteInput): Promise<VisiteRecord | null> {
  try {
    const data: Record<string, unknown> = {};
    if (input.matricule      !== undefined) data.matricule      = input.matricule.trim().toUpperCase();
    if (input.marque         !== undefined) data.marque         = input.marque.trim();
    if (input.modele         !== undefined) data.modele         = input.modele.trim();
    if (input.carId          !== undefined) data.carId          = input.carId;
    if (input.centre         !== undefined) data.centre         = input.centre.trim();
    if (input.dateVisite     !== undefined) data.dateVisite     = input.dateVisite;
    if (input.dateExpiration !== undefined) data.dateExpiration = input.dateExpiration;
    if (input.resultat       !== undefined) data.resultat       = input.resultat?.trim() || null;
    if (input.notes          !== undefined) data.notes          = input.notes?.trim() || null;
    return await prisma.visiteTechnique.update({ where: { id }, data });
  } catch { return null; }
}

export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.visiteTechnique.delete({ where: { id } });
    return true;
  } catch { return false; }
}
