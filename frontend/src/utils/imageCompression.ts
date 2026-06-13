/**
 * Compression d'images côté client AVANT envoi au backend.
 * Indispensable pour les photos de permis : on évite d'envoyer 5-10 Mo
 * sur l'API (limite Brevo ~10 Mo total par email).
 *
 * Stratégie : Canvas API → resize à maxDim x maxDim, export JPEG quality 80%.
 * Résultat typique : 50-500 KB par photo (vs 5-10 Mo en original).
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

export async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.8,
): Promise<File> {
  // PDF ou autres non-images : pas de compression possible
  if (!file.type.startsWith('image/')) return file;

  try {
    const dataUrl = await readAsDataUrl(file);
    const img = await loadImage(dataUrl);

    let { width, height } = img;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    width  = Math.round(width  * scale);
    height = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width  = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (!blob) return file;

    const newName = (file.name || 'image').replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch (e) {
    console.warn('Compression image échouée, fichier original utilisé', e);
    return file;
  }
}

export function isAcceptableSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
