import multer from 'multer';

/**
 * Stockage en mémoire (RAM) — on traite les fichiers à la volée et on les pousse à
 * Brevo en base64, donc pas besoin d'écrire sur le disque.
 */
const storage = multer.memoryStorage();

const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max par fichier
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype as typeof ALLOWED_MIME[number])) {
      cb(null, true);
    } else {
      cb(new Error('Format non accepté. Utilisez JPG, PNG, WEBP ou PDF.'));
    }
  },
});

/**
 * Middleware spécifique au formulaire de réservation :
 * accepte permis_recto + permis_verso (et permis pour rétrocompat).
 */
export const bookingUpload = upload.fields([
  { name: 'permis_recto', maxCount: 1 },
  { name: 'permis_verso', maxCount: 1 },
  { name: 'permis',       maxCount: 1 },
]);
