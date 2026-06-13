/**
 * Visite Technique Controller — CRUD pour les contrôles techniques.
 * Saisie libre du véhicule.
 */

import type { Request, Response } from 'express';
import * as repo from '../services/visite.repository.js';
import { logAction } from '../services/audit.service.js';
import { asTrimmedString } from '../utils/validation.utils.js';

function parseDate(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** GET /api/admin/visites */
export const list = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await repo.findAll();
    res.json({ success: true, visites: items, count: items.length });
  } catch (err) {
    console.error('❌ /api/admin/visites GET :', (err as Error).message);
    res.status(500).json({ success: false, message: 'Erreur de lecture.' });
  }
};

/** POST /api/admin/visites */
export const create = async (req: Request, res: Response): Promise<void> => {
  const matricule      = asTrimmedString(req.body?.matricule);
  const marque         = asTrimmedString(req.body?.marque);
  const modele         = asTrimmedString(req.body?.modele);
  const centre         = asTrimmedString(req.body?.centre);
  const dateVisite     = parseDate(req.body?.dateVisite);
  const dateExpiration = parseDate(req.body?.dateExpiration);
  const resultat       = asTrimmedString(req.body?.resultat) || undefined;
  const notes          = asTrimmedString(req.body?.notes) || undefined;

  if (!matricule)      { res.status(400).json({ success: false, message: 'Matricule requis.' }); return; }
  if (!marque)         { res.status(400).json({ success: false, message: 'Marque requise.' }); return; }
  if (!modele)         { res.status(400).json({ success: false, message: 'Modèle requis.' }); return; }
  if (!centre)         { res.status(400).json({ success: false, message: 'Centre de contrôle requis.' }); return; }
  if (!dateVisite)     { res.status(400).json({ success: false, message: 'Date de la visite requise.' }); return; }
  if (!dateExpiration) { res.status(400).json({ success: false, message: 'Date d\'expiration requise.' }); return; }
  if (dateExpiration <= dateVisite) { res.status(400).json({ success: false, message: 'La date d\'expiration doit être après la visite.' }); return; }

  try {
    const created = await repo.create({ matricule, marque, modele, centre, dateVisite, dateExpiration, resultat, notes });
    void logAction({
      userId:   req.admin?.id,
      username: req.admin?.u,
      action:   'visite.create',
      entity:   'VisiteTechnique',
      entityId: created.id,
      details:  {
        vehicle:        `${created.marque} ${created.modele} (${created.matricule})`,
        centre:         created.centre,
        dateExpiration: created.dateExpiration.toISOString().split('T')[0],
        resultat:       created.resultat,
      },
      req,
    });
    res.status(201).json({ success: true, visite: created });
  } catch (err) {
    console.error('❌ /api/admin/visites POST :', (err as Error).message);
    res.status(500).json({ success: false, message: 'Erreur de création.' });
  }
};

/** PUT /api/admin/visites/:id */
export const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id ?? ''), 10);
  if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'ID invalide.' }); return; }

  const existing = await repo.findById(id);
  if (!existing) { res.status(404).json({ success: false, message: 'Visite introuvable.' }); return; }

  const input: Parameters<typeof repo.update>[1] = {};
  if (req.body.matricule  !== undefined) input.matricule = asTrimmedString(req.body.matricule);
  if (req.body.marque     !== undefined) input.marque    = asTrimmedString(req.body.marque);
  if (req.body.modele     !== undefined) input.modele    = asTrimmedString(req.body.modele);
  if (req.body.centre     !== undefined) input.centre    = asTrimmedString(req.body.centre);
  if (req.body.dateVisite !== undefined) {
    const d = parseDate(req.body.dateVisite);
    if (!d) { res.status(400).json({ success: false, message: 'Date de visite invalide.' }); return; }
    input.dateVisite = d;
  }
  if (req.body.dateExpiration !== undefined) {
    const d = parseDate(req.body.dateExpiration);
    if (!d) { res.status(400).json({ success: false, message: 'Date d\'expiration invalide.' }); return; }
    input.dateExpiration = d;
  }
  if (req.body.resultat !== undefined) input.resultat = req.body.resultat === null ? null : asTrimmedString(req.body.resultat);
  if (req.body.notes    !== undefined) input.notes    = req.body.notes    === null ? null : asTrimmedString(req.body.notes);

  const updated = await repo.update(id, input);
  if (!updated) { res.status(500).json({ success: false, message: 'Erreur de mise à jour.' }); return; }

  void logAction({
    userId:   req.admin?.id,
    username: req.admin?.u,
    action:   'visite.update',
    entity:   'VisiteTechnique',
    entityId: id,
    details:  {
      vehicle:       `${updated.marque} ${updated.modele} (${updated.matricule})`,
      changedFields: Object.keys(input),
    },
    req,
  });
  res.json({ success: true, visite: updated });
};

/** DELETE /api/admin/visites/:id */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id ?? ''), 10);
  if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'ID invalide.' }); return; }

  const existing = await repo.findById(id);
  const ok = await repo.remove(id);
  if (!ok) { res.status(404).json({ success: false, message: 'Visite introuvable.' }); return; }

  void logAction({
    userId:   req.admin?.id,
    username: req.admin?.u,
    action:   'visite.delete',
    entity:   'VisiteTechnique',
    entityId: id,
    details:  existing
      ? { vehicle: `${existing.marque} ${existing.modele} (${existing.matricule})`, centre: existing.centre }
      : { id },
    req,
  });
  res.json({ success: true });
};
