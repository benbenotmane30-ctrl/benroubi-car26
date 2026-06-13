/** Section "Pourquoi nous" identique au legacy : #pourquoi + .pourquoi-grid + .atouts. */
export function PourquoiSection() {
  return (
    <section id="pourquoi">
      <div className="inner">
        <div className="pourquoi-grid">
          <div className="fade-in visible pourquoi-text">
            <p className="section-label">Nos engagements</p>
            <h2>Pourquoi choisir Benroubi Car ?</h2>
            <p>
              Agence de confiance à Oujda, reconnue pour son accueil chaleureux, ses tarifs honnêtes
              et la qualité de ses véhicules. Youssef est à votre écoute pour chaque demande.
            </p>
            <a href="#catalogue" className="btn-primary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              Voir les véhicules
            </a>
          </div>
          <div className="atouts fade-in visible">
            <div className="atout">
              <svg className="atout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h4>Véhicules certifiés</h4>
              <p>Révision complète avant chaque location. Assurance tous risques incluse.</p>
            </div>
            <div className="atout">
              <svg className="atout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h4>Validation humaine</h4>
              <p>Chaque demande est traitée personnellement par notre équipe sous 2h.</p>
            </div>
            <div className="atout">
              <svg className="atout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4>Disponibilité 6j/7</h4>
              <p>Prise en charge de 8h à 18h. Dépôt en dehors des heures sur demande.</p>
            </div>
            <div className="atout">
              <svg className="atout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h4>Tarifs transparents</h4>
              <p>Haute et basse saison affichés clairement. Kilométrage illimité inclus.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
