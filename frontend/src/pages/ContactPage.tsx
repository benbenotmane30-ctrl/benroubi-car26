/**
 * Page Contact — accessible via /contact
 * Réutilise les composants existants (Header, AgencySection, ContactSection, Footer).
 */

import { Header } from '../components/Header';
import { SeasonBar } from '../components/SeasonBar';
import { AgencySection } from '../components/AgencySection';
import { ContactSection } from '../components/ContactSection';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { Footer } from '../components/Footer';
import { SeasonProvider } from '../contexts/SeasonContext';

export function ContactPage() {
  return (
    <SeasonProvider>
      <Header />
      <SeasonBar />
      <main style={{ paddingTop: '6rem', minHeight: '100vh' }}>
        <AgencySection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </SeasonProvider>
  );
}
