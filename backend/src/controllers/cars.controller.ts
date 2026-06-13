import type { Request, Response } from 'express';
import * as carsRepo from '../services/cars.repository.js';
import { logAction } from '../services/audit.service.js';
import type { Car } from '../types/index.js';

/**
 * GET /api/cars — PUBLIC
 * Renvoie la liste de toutes les voitures du catalogue depuis PostgreSQL.
 */
export const listCars = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cars = await carsRepo.findAll();
    // updatedAt = max des updatedAt individuels (pour la logique de sync côté admin)
    const updatedAt = cars.length > 0
      ? Math.max(...cars.map(c => c.updatedAt ?? 0))
      : null;
    res.json({
      success:      true,
      cars,
      cloudEnabled: true,
      updatedAt,
      count:        cars.length,
    });
  } catch (err) {
    const e = err as Error;
    console.error('❌ /api/cars :', e.message);
    res.status(500).json({ success: false, message: 'Erreur de lecture base de données.', error: e.message });
  }
};

/**
 * PUT /api/admin/cars — AUTH
 * Body : { cars: Car[] }
 * Remplace l'intégralité du catalogue. Conserve la rétrocompatibilité avec
 * l'ancien endpoint Upstash (qui faisait pareil).
 */
export const saveAllCars = async (req: Request, res: Response): Promise<void> => {
  const cars = req.body?.cars as Car[] | undefined;
  const confirmEmpty = req.body?.confirmEmpty === true;
  if (!Array.isArray(cars)) {
    res.status(422).json({ success: false, message: 'Body invalide : { cars: [...] } attendu.' });
    return;
  }

  if (cars.length === 0 && !confirmEmpty) {
    console.warn(`⚠️  Tentative d'écrasement avec un catalogue vide refusée — admin ${req.admin?.u}`);
    res.status(409).json({
      success: false,
      message: 'Refus de vider le catalogue. Pour confirmer, renvoyez le body avec confirmEmpty: true.',
    });
    return;
  }

  try {
    const previousCount = (await carsRepo.findAll()).length;
    const { count, updatedAt } = await carsRepo.replaceAll(cars);
    console.log(`🗄️  Catalogue mis à jour — ${count} voitures — admin ${req.admin?.u}`);
    void logAction({
      userId:   req.admin?.id,
      username: req.admin?.u,
      action:   count === 0 ? 'car.clear' : 'car.replaceAll',
      entity:   'Car',
      details:  { previousCount, newCount: count, delta: count - previousCount },
      req,
    });
    res.json({ success: true, count, updatedAt });
  } catch (err) {
    const e = err as Error;
    console.error('❌ /api/admin/cars :', e.message);
    res.status(500).json({ success: false, message: 'Erreur d\'écriture base de données.', error: e.message });
  }
};
