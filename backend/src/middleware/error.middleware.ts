import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';

/**
 * Handler global d'erreurs Express.
 * Doit être enregistré APRÈS toutes les routes (last middleware).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // ESLint râle si on supprime next, et Express exige les 4 args sur un error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Erreurs Multer (upload de fichiers)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(422).json({ success: false, message: 'Fichier trop volumineux (max 5 Mo).' });
      return;
    }
    res.status(422).json({ success: false, message: err.message });
    return;
  }

  // Erreur custom du fileFilter Multer (format non accepté, etc.)
  if (err && err.message) {
    console.error('❌ Erreur :', err.message);
    res.status(422).json({ success: false, message: err.message });
    return;
  }

  // Erreur inattendue
  console.error('❌ Erreur non gérée :', err);
  res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
}
