/** Section agence identique au legacy : #agences + .agences-grid + map-container. */
export function AgencySection() {
  return (
    <section id="agences">
      <div className="inner">
        <div className="agences-grid">
          <div className="fade-in visible">
            <p className="section-label">Localisation</p>
            <h2>Notre agence</h2>
            <div className="agence-list">
              <div className="agence-item active">
                <h4>Benroubi Car</h4>
                <p>80 Bd Rahmouni Boualam<br />60000 Oujda, Maroc<br />+212 6 62 11 43 21</p>
                <div className="agence-hours">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Lundi – Samedi : 9h00 – 19h30</span>
                </div>
              </div>
            </div>
          </div>
          <div className="map-container fade-in visible">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.141748695994!2d-1.943205525155004!3d34.67637178451934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7864d01f94ae55%3A0xf2c7619eafcb0db9!2sBenroubi%20Car!5e0!3m2!1sfr!2sma!4v1780575230599!5m2!1sfr!2sma"
              title="Localisation Benroubi Car — Oujda"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
