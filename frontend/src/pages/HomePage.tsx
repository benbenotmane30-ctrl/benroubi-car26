import { useState } from 'react';
import { Header } from '../components/Header';
import { SeasonBar } from '../components/SeasonBar';
import { Hero } from '../components/Hero';
import { PourquoiSection } from '../components/PourquoiSection';
import { CarsCatalog } from '../components/CarsCatalog';
import { BookingModal } from '../components/BookingModal';
import { AgencySection } from '../components/AgencySection';
import { ContactSection } from '../components/ContactSection';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { Footer } from '../components/Footer';
import { SeasonProvider } from '../contexts/SeasonContext';
import type { Car } from '../types/car';

export function HomePage() {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  return (
    <SeasonProvider>
      <Header />
      <SeasonBar />
      <main>
        <Hero />
        <PourquoiSection />
        <CarsCatalog onCarSelect={setSelectedCar} />
        <AgencySection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />

      <BookingModal car={selectedCar} onClose={() => setSelectedCar(null)} />
    </SeasonProvider>
  );
}
