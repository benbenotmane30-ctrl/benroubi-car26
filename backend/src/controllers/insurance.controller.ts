/**
 * Insurance Controller — CRUD pour les polices d'assurance.
 * Saisie libre du véhicule (matricule/marque/modele tapés à la main).
 * Tous les Admin connectés peuvent gérer.
 */

import type { Request, Response } from 'express';
import * as repo from '../services/insurance.repository.js';
import { logAction } from '../services/audit.service.js';
import { asTrimmedString } from '../utils/validation.utils.js';

function parseDate(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** GET /api/admin/insurances */
export const list = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await repo.findAll();
    res.json({ success: true, insurances: items, count: items.length });
  } catch (err) {
    console.error('❌ /api/admin/insurances GET :', (err as Error).message);
    res.status(500).json({ success: false, message: 'Erreur de lecture.' });
  }
};

/** GET /api/admin/insurances/:id */
export const getOne = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id ?? ''), 10);
  if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'ID invalide.' }); return; }
  const item = await repo.findById(id);
  if (!item) { res.status(404).json({ success: false, message: 'Assurance introuvable.' }); return; }
  res.json({ success: true, insurance: item });
};

/** POST /api/admin/insurances */
export const create = async (req: Request, res: Response): Promise<void> => {
  const matricule  = asTrimmedString(req.body?.matricule);
  const marque     = asTrimmedString(req.body?.marque);
  const modele     = asTrimmedString(req.body?.modele);
  const compagnie  = asTrimmedString(req.body?.compagnie);
  const dateDebut  = parseDate(req.body?.dateDebut);
  const dateFin    = parseDate(req.body?.dateFin);
  const montantMad = req.body?.montantMad != null && req.body.montantMad !== '' ? parseInt(String(req.body.montantMad), 10) : undefined;
  const notes      = asTrimmedString(req.body?.notes) || undefined;

  if (!matricule)              { res.status(400).json({ success: false, message: 'Matricule requis.' }); return; }
  if (!marque)                 { res.status(400).json({ success: false, message: 'Marque requise.' }); return; }
  if (!modele)                 { res.status(400).json({ success: false, message: 'Modèle requis.' }); return; }
  if (!compagnie)              { res.status(400).json({ success: false, message: 'Compagnie requise.' }); return; }
  if (!dateDebut || !dateFin)  { res.status(400).json({ success: false, message: 'Dates de début et fin requises.' }); return; }
  if (dateFin <= dateDebut)    { res.status(400).json({ success: false, message: 'La date de fin doit être après le début.' }); return; }

  try {
    const created = await repo.create({ matricule, marque, modele, compagnie, dateDebut, dateFin, montantMad, notes });
    void logAction({
      userId:   req.admin?.id,
      username: req.admin?.u,
      action:   'insurance.create',
      entity:   'Insurance',
      entityId: created.id,
      details:  {
        vehicle:   `${created.marque} ${created.modele} (${created.matricule})`,
        compagnie: created.compagnie,
        dateFin:   created.dateFin.toISOString().split('T')[0],
      },
      req,
    });
    res.status(201).json({ success: true, insurance: created });
  } catch (err) {
    console.error('❌ /api/admin/insurances POST :', (err as Error).message);
    res.status(500).json({ success: false, message: 'Erreur de création.' });
  }
};

/** PUT /api/admin/insurances/:id */
export const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id ?? ''), 10);
  if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'ID invalide.' }); return; }

  const existing = await repo.findById(id);
  if (!existing) { res.status(404).json({ success: false, message: 'Assurance introuvable.' }); return; }

  const input: Parameters<typeof repo.update>[1] = {};
  if (req.body.matricule !== undefined) input.matricule = asTrimmedString(req.body.matricule);
  if (req.body.marque    !== undefined) input.marque    = asTrimmedString(req.body.marque);
  if (req.body.modele    !== undefined) input.modele    = asTrimmedString(req.body.modele);
  if (req.body.compagnie !== undefined) input.compagnie = asTrimmedString(req.body.compagnie);
  if (req.body.dateDebut !== undefined) {
    const d = parseDate(req.body.dateDebut);
    if (!d) { res.status(400).json({ success: false, message: 'Date de début invalide.' }); return; }
    input.dateDebut = d;
  }
  if (req.body.dateFin !== undefined) {
    const d = parseDate(req.body.dateFin);
    if (!d) { res.status(400).json({ success: false, message: 'Date de fin invalide.' }); return; }
    input.dateFin = d;
  }
  if (req.body.montantMad !== undefined) input.montantMad = req.body.montantMad === null || req.body.montantMad === '' ? null : parseInt(String(req.body.montantMad), 10);
  if (req.body.notes      !== undefined) input.notes      = req.body.notes === null ? null : asTrimmedString(req.body.notes);

  const updated = await repo.update(id, input);
  if (!updated) { res.status(500).json({ success: false, message: 'Erreur de mise à jour.' }); return; }

  void logAction({
    userId:   req.admin?.id,
    username: req.admin?.u,
    action:   'insurance.update',
    entity:   'Insurance',
    entityId: id,
    details:  {
      vehicle:       `${updated.marque} ${updated.modele} (${updated.matricule})`,
      changedFields: Object.keys(input),
    },
    req,
  });
  res.json({ success: true, insurance: updated });
};

/** DELETE /api/admin/insurances/:id */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id ?? ''), 10);
  if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'ID invalide.' }); return; }

  const existing = await repo.findById(id);
  const ok = await repo.remove(id);
  if (!ok) { res.status(404).json({ success: false, message: 'Assurance introuvable.' }); return; }

  void logAction({
    userId:   req.admin?.id,
    username: req.admin?.u,
    action:   'insurance.delete',
    entity:   'Insurance',
    entityId: id,
    details:  existing
      ? {
          vehicle:   `${existing.marque} ${existing.modele} (${existing.matricule})`,
          compagnie: existing.compagnie,
        }
      : { id },
    req,
  });
  res.json({ success: true });
};
