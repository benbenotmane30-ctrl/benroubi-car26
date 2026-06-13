/**
 * Hero épuré et impactant — Benroubi Car.
 *
 * Design :
 *   - Background : photo de la 1ère voiture disponible (fallback gradient noir/or sinon)
 *   - Overlay sombre dégradé pour lisibilité
 *   - Contenu centré-bas-gauche : eyebrow + titre marketing + sub + 2 CTA + stats
 *   - Pas de slider, pas d'autoplay : sobre et premium
 */

import { useMemo } from 'react';
import { useCars } from '../hooks/useCars';

export function Hero() {
  const { cars } = useCars();

  // Trouve la meilleure photo : 1ère voiture dispo avec photo. Sinon fallback CSS.
  const bgImage = useMemo(() => {
    const car = cars.find(c => c.dispo && c.photos && c.photos[0]);
    return car?.photos?.[0] ?? null;
  }, [cars]);

  return (
    <section id="accueil" className={bgImage ? 'hero-photo' : ''}>
      {bgImage ? (
        <>
          <div className="hero-photo-bg" style={{ backgroundImage: `url(${bgImage})` }}>
            <img src={bgImage} alt="" style={{ display: 'none' }} fetchPriority="high" />
          </div>
          <div className="hero-photo-overlay" />
        </>
      ) : (
        <>
          <div className="hero-bg" />
          <div className="hero-grid" />
        </>
      )}

      <div className="hero-content">
        <p className="hero-eyebrow">Location de voitures · Oujda, Maroc</p>
        <h1>
          Louez votre<br />
          <em>liberté</em><br />
          en toute sérénité
        </h1>
        <p className="hero-sub">
          Une flotte premium entretenue avec soin, des tarifs transparents et un service personnalisé
          6j/7. Bienvenue chez Benroubi Car.
        </p>
        <div className="hero-actions">
          <a href="#catalogue" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            Découvrir la flotte
          </a>
          <a href="#contact" className="btn-outline">Nous contacter</a>
        </div>
      </div>

      <div className="hero-stats">
        <div className="stat">
          <div className="stat-num">4,7<span>★</span></div>
          <div className="stat-label">Note Google</div>
        </div>
        <div className="stat">
          <div className="stat-num">101<span>+</span></div>
          <div className="stat-label">Avis clients</div>
        </div>
        <div className="stat">
          <div className="stat-num">15<span>+</span></div>
          <div className="stat-label">Véhicules</div>
        </div>
      </div>
    </section>
  );
}
