import { useSeasonContext } from '../contexts/SeasonContext';
import type { Car } from '../types/car';

interface Props {
  car: Car;
  onSelect: (car: Car) => void;
}

/** Carte voiture identique au legacy : .car-card + .car-img + .car-info + .car-footer. */
export function CarCard({ car, onSelect }: Props) {
  const { season } = useSeasonContext();
  const hasPhoto = !!(car.photos && car.photos[0]);

  const handleClick = () => onSelect(car);
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
  };

  return (
    <div className="car-card fade-in visible" onClick={handleClick} onKeyDown={handleKey} role="button" tabIndex={0}>
      <div className="car-img">
        {hasPhoto ? (
          <img src={car.photos![0]} alt={car.name} loading="lazy" />
        ) : (
          <div className="car-img-ph">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 16H9m10 0h2a2 2 0 0 0 2-2v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1.5 1.5 0 0 0 16.732 5H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1" />
              <circle cx="6.5" cy="16.5" r="2.5" />
              <circle cx="16.5" cy="16.5" r="2.5" />
            </svg>
            <span>Photo bientôt</span>
          </div>
        )}
        {car.badge && <div className="car-badge">{car.badge}</div>}
        {!car.dispo && <div className="car-badge-indispo">Indispo</div>}
      </div>
      <div className="car-info">
        <div className="car-name">{car.name}</div>
        <div className="car-specs">
          <div className="spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 22h12V2H3v20zM15 11l4-3v11l-4 3" />
            </svg>
            {car.carburant}
          </div>
          <div className="spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            {car.boite}
          </div>
          <div className="spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            {car.places} places
          </div>
        </div>
        <div className="car-footer">
          <div className="price-compare">
            <div className={`price-pill ${season === 'haut' ? 'active' : ''}`}>
              <div className="pp-head">
                <span className="pp-icon">☀️</span>
                <span className="pp-label">Haute saison</span>
              </div>
              <div className="pp-price">{car.prix_haut}<span className="pp-unit">MAD/j</span></div>
            </div>
            <div className={`price-pill ${season === 'bas' ? 'active' : ''}`}>
              <div className="pp-head">
                <span className="pp-icon">🍂</span>
                <span className="pp-label">Basse saison</span>
              </div>
              <div className="pp-price">{car.prix_bas}<span className="pp-unit">MAD/j</span></div>
            </div>
          </div>

          <button className="btn-card btn-card-full" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
            Réserver maintenant
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
