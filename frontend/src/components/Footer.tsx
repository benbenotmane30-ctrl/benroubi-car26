/**
 * Footer premium — Benroubi Car.
 * Palette noir/or, 4 colonnes responsive, icônes sociales modernes.
 */

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <a href="#accueil" className="logo">Benroubi<span> Car</span></a>
          <p>
            Agence de location de voitures à Oujda, Maroc. Service personnalisé, véhicules entretenus
            et tarifs transparents pour tous vos déplacements.
          </p>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h5>Contact</h5>
          <a href="mailto:benroubicar@yahoo.fr" className="footer-link">
            <FooterIcon type="mail" />
            <span>benroubicar@yahoo.fr</span>
          </a>
          <a href="tel:+212662114321" className="footer-link">
            <FooterIcon type="phone" />
            <span>+212 6 62 11 43 21</span>
          </a>
          <a href="tel:+212655546276" className="footer-link">
            <FooterIcon type="phone" />
            <span>+212 6 55 54 62 76</span>
          </a>
        </div>

        {/* Horaires */}
        <div className="footer-col">
          <h5>Horaires d'ouverture</h5>
          <div className="hours-row">
            <span className="hours-day">Lun – Ven</span>
            <span className="hours-time">09h00 – 17h00</span>
          </div>
          <div className="hours-row">
            <span className="hours-day">Samedi</span>
            <span className="hours-time">09h00 – 12h00</span>
          </div>
          <div className="hours-row">
            <span className="hours-day">Dimanche</span>
            <span className="hours-time hours-closed">Fermé</span>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="footer-col">
          <h5>Suivez-nous</h5>
          <p className="footer-social-text">
            Découvrez nos véhicules et offres en avant-première.
          </p>
          <div className="footer-social-row">
            <a
              href="https://www.instagram.com/location.voiture.aeropport.oud?igsh=MTNoeW9remowMGY1cg=="
              target="_blank" rel="noopener noreferrer"
              className="social-btn" aria-label="Instagram"
              title="Instagram"
            >
              <SocialIcon type="instagram" />
            </a>
            <a
              href="https://www.facebook.com/share/1BKhsA2YWK/?mibextid=wwXIfr"
              target="_blank" rel="noopener noreferrer"
              className="social-btn" aria-label="Facebook"
              title="Facebook"
            >
              <SocialIcon type="facebook" />
            </a>
            <a
              href="https://wa.me/212662114321"
              target="_blank" rel="noopener noreferrer"
              className="social-btn" aria-label="WhatsApp"
              title="WhatsApp"
            >
              <SocialIcon type="whatsapp" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {year} Benroubi Car — Tous droits réservés.</span>
        <span className="footer-bottom-extra">Conçu avec passion à Oujda 🇲🇦</span>
      </div>
    </footer>
  );
}

// ─── Icônes inline ─────────────────────────────────────

function FooterIcon({ type }: { type: 'mail' | 'phone' }) {
  const common = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 };
  if (type === 'mail') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function SocialIcon({ type }: { type: 'instagram' | 'facebook' | 'whatsapp' }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (type === 'instagram') {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }
  if (type === 'facebook') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }
  // WhatsApp
  return (
    <svg {...common} aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
