/**
 * Page Catalogue — accessible via /catalogue
 * Réutilise les composants existants (Header, SeasonBar, CarsCatalog, BookingModal, Footer).
 * Le site est principalement "one-pager" via la HomePage, cette page sert pour les liens directs.
 */

import { useState } from 'react';
import { Header } from '../components/Header';
import { SeasonBar } from '../components/SeasonBar';
import { CarsCatalog } from '../components/CarsCatalog';
import { BookingModal } from '../components/BookingModal';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { Footer } from '../components/Footer';
import { SeasonProvider } from '../contexts/SeasonContext';
import type { Car } from '../types/car';

export function CataloguePage() {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  return (
    <SeasonProvider>
      <Header />
      <SeasonBar />
      <main style={{ paddingTop: '6rem', minHeight: '100vh' }}>
        <CarsCatalog onCarSelect={setSelectedCar} />
      </main>
      <Footer />
      <WhatsAppButton />

      <BookingModal car={selectedCar} onClose={() => setSelectedCar(null)} />
    </SeasonProvider>
  );
}
