import { useNavigate } from 'react-router-dom';
import { useCars } from '../contexts/CarsContext';

/** Dashboard avec 4 KPI cards + liste des dernières voitures ajoutées. */
export function DashboardPage() {
  const { cars, importDefaults } = useCars();
  const navigate = useNavigate();

  const dispo = cars.filter(c => c.dispo).length;
  const indispo = cars.length - dispo;
  const prixMoy = cars.length
    ? Math.round(cars.reduce((a, c) => a + (Number(c.prix_haut) || 0), 0) / cars.length)
    : 0;

  const recent = [...cars]
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    .slice(0, 5);

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h2>Tableau de bord</h2>
          <p className="subtitle">Vue d'ensemble de votre flotte et statistiques en temps réel.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => navigate('/preview')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Aperçu
          </button>
          <button className="btn btn-gold" onClick={() => navigate('/fleet?new=1')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouveau véhicule
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard label="Véhicules"    value={cars.length} color="gold"  icon={<path d="M14 16H9m10 0h2a2 2 0 0 0 2-2v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1.5 1.5 0 0 0 16.732 5H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1" />} />
        <KpiCard label="Disponibles"  value={dispo}       color="vert"  icon={<polyline points="20 6 9 17 4 12" />} />
        <KpiCard label="Indisponibles" value={indispo}    color="rouge" icon={<><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>} />
        <KpiCard label="Prix moyen"   value={prixMoy}     color="bleu"  suffix=" MAD/j" icon={<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />} />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Derniers véhicules ajoutés</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/fleet')}>Voir tout →</button>
        </div>
        <div className="card-body">
          {recent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--noir)', marginBottom: '0.4rem' }}>
                Bienvenue dans votre admin
              </h3>
              <p style={{ color: 'var(--gris-500)', fontSize: '0.88rem', marginBottom: '1.4rem', maxWidth: '420px', margin: '0 auto 1.4rem' }}>
                Pour démarrer rapidement, importez les 15 voitures déjà présentes dans le catalogue.
              </p>
              <div style={{ display: 'flex', gap: '.7rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-gold" onClick={() => importDefaults()}>Importer les 15 voitures de base</button>
                <button className="btn btn-outline" onClick={() => navigate('/fleet?new=1')}>Ajouter manuellement</button>
              </div>
            </div>
          ) : (
            recent.map(car => (
              <div className="recent-item" key={car.id}>
                <div className="car-thumb">
                  {car.photos?.[0] ? <img src={car.photos[0]} alt="" /> : '🚗'}
                </div>
                <div className="info">
                  <strong>{car.name}</strong>
                  <div className="meta">{car.carburant} · {car.boite} · {car.places} places</div>
                </div>
                <div className="price">{car.prix_haut} MAD/j</div>
                <span className={`badge ${car.dispo ? 'badge-dispo' : 'badge-indispo'}`}>
                  {car.dispo ? 'Dispo' : 'Indispo'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  color: 'gold' | 'vert' | 'rouge' | 'bleu';
  suffix?: string;
  icon: React.ReactNode;
}

function KpiCard({ label, value, color, suffix = '', icon }: KpiCardProps) {
  return (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-head">
        <div className="kpi-label">{label}</div>
        <div className={`kpi-icon ${color}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
        </div>
      </div>
      <div className="kpi-value">{value}<span className="unit">{suffix}</span></div>
    </div>
  );
}
