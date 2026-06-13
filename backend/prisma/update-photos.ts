/**
 * Script one-shot : met à jour les photos des 15 voitures de base.
 * Les images sont servies depuis frontend/public/images/cars/ via une URL relative.
 *
 * Lance-le après le seed pour avoir des vraies photos sur le catalogue :
 *   npx tsx prisma/update-photos.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PHOTOS_BY_ID: Record<number, string> = {
  1:  '/images/cars/peugeot-208-hybrid.webp',
  2:  '/images/cars/peugeot-208-style.jpg',
  3:  '/images/cars/volkswagen-tiguan.jpg',
  4:  '/images/cars/peugeot-208-allure.webp',
  5:  '/images/cars/peugeot-208.jpg',
  6:  '/images/cars/opel-corsa.jpg',
  7:  '/images/cars/renault-clio-5.webp',
  8:  '/images/cars/dacia-duster-auto.webp',
  9:  '/images/cars/dacia-duster-manuel.jpg',
  10: '/images/cars/dacia-stepway.webp',
  11: '/images/cars/dacia-streetway.webp',
  12: '/images/cars/dacia-logan.jpg',
  13: '/images/cars/seat-arona.png',
  14: '/images/cars/hyundai-creta.avif',
  15: '/images/cars/hyundai-accent.jpg',
};

async function main(): Promise<void> {
  console.log('📸 Mise à jour des photos…');
  for (const [idStr, path] of Object.entries(PHOTOS_BY_ID)) {
    const id = Number(idStr);
    const updated = await prisma.car.update({
      where: { id },
      data:  { photos: [path] },
    });
    console.log(`  ✓ #${id} ${updated.name} → ${path}`);
  }
  console.log('✅ Photos mises à jour.');
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => void prisma.$disconnect());
