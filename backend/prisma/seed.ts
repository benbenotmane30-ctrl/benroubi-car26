/**
 * Script de seed — Insère les 15 voitures de base dans la DB PostgreSQL.
 * À exécuter une seule fois après la première migration :
 *   npx tsx prisma/seed.ts
 *
 * Idempotent : si des voitures existent déjà avec les IDs 1-15, on ne fait rien.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedCar {
  id: number;
  name: string;
  marque: string;
  modele: string;
  category: string;
  badge: string;
  carburant: string;
  boite: string;
  places: number;
  prixHaut: number;
  prixBas: number;
  description: string;
}

const DEFAULT_CARS: SeedCar[] = [
  { id: 1,  marque: 'Peugeot',    modele: '208 Hybrid',     name: 'Peugeot 208 Hybrid',     category: 'citadine', badge: 'Citadine',    carburant: 'Essence', boite: 'Automatique', places: 5, prixHaut: 500,  prixBas: 300, description: 'Citadine hybride moderne, économique et agréable à conduire. Idéale pour la ville et les routes d\'Oujda.' },
  { id: 2,  marque: 'Peugeot',    modele: '208 Style',      name: 'Peugeot 208 Style',      category: 'citadine', badge: 'Citadine',    carburant: 'Diesel',  boite: 'Manuelle',    places: 5, prixHaut: 350,  prixBas: 250, description: 'Citadine élégante et économique. Parfaite pour tous vos déplacements quotidiens.' },
  { id: 3,  marque: 'Volkswagen', modele: 'Tiguan',         name: 'Volkswagen Tiguan',      category: 'suv',      badge: 'SUV Premium', carburant: 'Diesel',  boite: 'Automatique', places: 5, prixHaut: 1000, prixBas: 700, description: 'SUV premium spacieux et puissant. Confort d\'exception pour vos longs trajets et aventures.' },
  { id: 4,  marque: 'Peugeot',    modele: '208 Allure',     name: 'Peugeot 208 Allure',     category: 'citadine', badge: 'Citadine',    carburant: 'Diesel',  boite: 'Manuelle',    places: 5, prixHaut: 400,  prixBas: 300, description: 'Version Allure du 208, équipements enrichis et finition soignée. Conduite plaisante.' },
  { id: 5,  marque: 'Peugeot',    modele: '208',            name: 'Peugeot 208',            category: 'citadine', badge: 'Citadine',    carburant: 'Diesel',  boite: 'Manuelle',    places: 5, prixHaut: 350,  prixBas: 250, description: 'La référence des citadines. Fiable, économique et facile à conduire en ville.' },
  { id: 6,  marque: 'Opel',       modele: 'Corsa',          name: 'Opel Corsa',             category: 'citadine', badge: 'Citadine',    carburant: 'Diesel',  boite: 'Manuelle',    places: 5, prixHaut: 350,  prixBas: 250, description: 'Compacte dynamique et maniable. Idéale pour se déplacer facilement en ville.' },
  { id: 7,  marque: 'Renault',    modele: 'Clio 5',         name: 'Renault Clio 5',         category: 'citadine', badge: 'Citadine',    carburant: 'Diesel',  boite: 'Manuelle',    places: 5, prixHaut: 350,  prixBas: 250, description: 'La Clio 5, icône du marché. Moderne, confortable et très économique.' },
  { id: 8,  marque: 'Dacia',      modele: 'Duster Auto.',   name: 'Dacia Duster Auto.',     category: 'suv',      badge: 'SUV Auto.',   carburant: 'Diesel',  boite: 'Automatique', places: 5, prixHaut: 450,  prixBas: 350, description: 'Le Duster automatique — robuste et polyvalent, prêt pour tous les terrains du Maroc.' },
  { id: 9,  marque: 'Dacia',      modele: 'Duster Manuel',  name: 'Dacia Duster Manuel',    category: 'suv',      badge: 'SUV 4×4',     carburant: 'Diesel',  boite: 'Manuelle',    places: 5, prixHaut: 400,  prixBas: 300, description: 'Le Duster manuel — SUV robuste idéal pour l\'aventure et les routes non goudronnées.' },
  { id: 10, marque: 'Dacia',      modele: 'Stepway',        name: 'Dacia Stepway',          category: 'citadine', badge: 'Crossover',   carburant: 'Diesel',  boite: 'Manuelle',    places: 5, prixHaut: 350,  prixBas: 250, description: 'Crossover urbain surélevé. Style baroudeur et praticité au quotidien.' },
  { id: 11, marque: 'Dacia',      modele: 'Streetway',      name: 'Dacia Streetway',        category: 'citadine', badge: 'Économique', carburant: 'Diesel',  boite: 'Manuelle',    places: 5, prixHaut: 300,  prixBas: 250, description: 'Le choix économique par excellence. Simple, fiable et très accessible.' },
  { id: 12, marque: 'Dacia',      modele: 'Logan',          name: 'Dacia Logan',            category: 'berline',  badge: 'Berline',     carburant: 'Diesel',  boite: 'Manuelle',    places: 5, prixHaut: 350,  prixBas: 250, description: 'Berline spacieuse et économique. Grand coffre idéal pour les familles et longs trajets.' },
  { id: 13, marque: 'Seat',       modele: 'Arona',          name: 'Seat Arona',             category: 'suv',      badge: 'SUV Sport',   carburant: 'Diesel',  boite: 'Manuelle',    places: 5, prixHaut: 400,  prixBas: 300, description: 'SUV compact et sportif. Design moderne, conduite dynamique et agréable.' },
  { id: 14, marque: 'Hyundai',    modele: 'Creta',          name: 'Hyundai Creta',          category: 'suv',      badge: 'SUV Auto.',   carburant: 'Essence', boite: 'Automatique', places: 5, prixHaut: 400,  prixBas: 300, description: 'SUV familial moderne, confortable et bien équipé. Excellent rapport qualité-prix.' },
  { id: 15, marque: 'Hyundai',    modele: 'Accent',         name: 'Hyundai Accent',         category: 'berline',  badge: 'Berline',     carburant: 'Essence', boite: 'Automatique', places: 5, prixHaut: 400,  prixBas: 300, description: 'Berline confortable et fiable. Boîte automatique pour une conduite sans stress.' },
];

async function main(): Promise<void> {
  console.log('🌱 Seed — Insertion des 15 voitures de base...');

  const existing = await prisma.car.count();
  if (existing >= DEFAULT_CARS.length) {
    console.log(`✓ Déjà ${existing} voitures en base, seed ignoré.`);
    return;
  }

  // Création en parallèle (Prisma gère les conflits si on relance)
  for (const car of DEFAULT_CARS) {
    await prisma.car.upsert({
      where:  { id: car.id },
      update: {}, // ne touche pas si existe déjà
      create: {
        ...car,
        photos: [],
        dispo:  true,
      },
    });
    console.log(`  ✓ Voiture #${car.id} : ${car.name}`);
  }

  // Avancer la séquence d'autoincrement au-delà des IDs hardcodés
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('cars', 'id'), $1::int)`,
    DEFAULT_CARS.length,
  );

  const total = await prisma.car.count();
  console.log(`✅ Seed terminé — ${total} voitures en base.`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed :', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
