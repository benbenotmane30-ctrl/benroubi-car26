import { useState, useMemo } from 'react';
import { CarCard } from './CarCard';
import { useCars } from '../hooks/useCars';
import type { Car, CarCategory } from '../types/car';

type Filter = 'all' | CarCategory;
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',      label: 'Tous'      },
  { value: 'citadine', label: 'Citadines' },
  { value: 'berline',  label: 'Berlines'  },
  { value: 'suv',      label: 'SUV / 4×4' },
];

interface Props {
  onCarSelect: (car: Car) => void;
}

/** Catalogue identique au legacy : #catalogue + .cat-head + .filter-tabs + .cars-grid. */
export function CarsCatalog({ onCarSelect }: Props) {
  const { cars, loading, error, refetch } = useCars();
  const [filter, setFilter] = useState<Filter>('all');

  const visibleCars = useMemo(() => {
    if (filter === 'all') return cars;
    return cars.filter(c => c.category === filter);
  }, [cars, filter]);

  return (
    <section id="catalogue">
      <div className="inner">
        <div className="cat-head fade-in visible">
          <div>
            <p className="section-label">Notre flotte</p>
            <h2>Tous nos véhicules</h2>
          </div>
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button
                key={f.value}
                className={`filter-tab ${filter === f.value ? 'active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label} {f.value === 'all' && `(${cars.length})`}
              </button>
            ))}
          </div>
        </div>

        {loading && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--gris)' }}>Chargement…</p>}
        {error && (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#DC2626' }}>
            ❌ {error}
            <button className="btn-card" style={{ marginLeft: '1rem' }} onClick={() => void refetch()}>Réessayer</button>
          </p>
        )}

        {!loading && !error && (
          <div className="cars-grid" id="cars-grid">
            {visibleCars.map(car => (
              <CarCard key={car.id} car={car} onSelect={onCarSelect} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
