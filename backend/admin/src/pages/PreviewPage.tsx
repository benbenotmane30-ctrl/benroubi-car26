import { useCars } from '../contexts/CarsContext';

export function PreviewPage() {
  const { cars } = useCars();

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h2>Aperçu du catalogue</h2>
          <p className="subtitle">Visualisez le rendu de vos véhicules tel que vos clients les verront.</p>
        </div>
        <div className="page-actions">
          <a href="http://localhost:5173" target="_blank" rel="noopener" className="btn btn-outline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Ouvrir le site
          </a>
        </div>
      </div>

      {cars.length === 0 ? (
        <p style={{ color: 'var(--gris-500)', textAlign: 'center', padding: '3rem' }}>
          Aucun véhicule à prévisualiser.
        </p>
      ) : (
        <div className="preview-grid">
          {cars.map(car => (
            <div key={car.id} className="preview-card">
              <div className="pc-img">
                {car.photos?.[0] ? <img src={car.photos[0]} alt={car.name} /> : <span className="no-photo">Aucune photo</span>}
                <div className="pc-cat">{car.badge ?? car.category}</div>
                {!car.dispo && <div className="pc-bad">Indispo</div>}
              </div>
              <div className="pc-body">
                <div className="pc-name">
                  {car.name.split(' ').slice(0, 2).join(' ')}
                  {car.annee && <span className="year"> {car.annee}</span>}
                </div>
                <div className="pc-specs">
                  <span>⛽ {car.carburant}</span>
                  <span>⚙️ {car.boite}</span>
                  <span>👥 {car.places}</span>
                </div>
                <div className="pc-foot">
                  <div className="pc-price-block">
                    <div className="pc-season">☀️ Haute saison</div>
                    <div className="pc-price">
                      {car.prix_haut}
                      <span className="pc-unit"> MAD/j</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
