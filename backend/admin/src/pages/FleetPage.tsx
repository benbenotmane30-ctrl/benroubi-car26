import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCars } from '../contexts/CarsContext';
import { CarDrawer } from '../components/CarDrawer';
import type { Car } from '../types';

type Filter = 'all' | 'dispo' | 'indispo' | 'citadine' | 'berline' | 'suv';

export function FleetPage() {
  const { cars, deleteCar, toggleDispo, importDefaults, clearAll } = useCars();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Si l'URL contient ?new=1, ouvre le drawer en mode création
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingCar(null);
      setDrawerOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const visibleCars = useMemo(() => {
    let list = cars;
    if (filter === 'dispo')   list = list.filter(c => c.dispo);
    else if (filter === 'indispo') list = list.filter(c => !c.dispo);
    else if (filter !== 'all')     list = list.filter(c => c.category === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [cars, filter, search]);

  const handleAdd = () => { setEditingCar(null); setDrawerOpen(true); };
  const handleEdit = (car: Car) => { setEditingCar(car); setDrawerOpen(true); };
  const handleDelete = (car: Car) => {
    if (!confirm(`Supprimer "${car.name}" du catalogue ?`)) return;
    deleteCar(car.id);
  };

  const handleClearAll = async () => {
    if (cars.length === 0) { alert('Le catalogue est déjà vide.'); return; }
    const step1 = confirm(
      `⚠️ VIDER TOUT LE CATALOGUE ?\n\n` +
      `Vous allez supprimer DÉFINITIVEMENT ${cars.length} voiture${cars.length > 1 ? 's' : ''} ` +
      `de la BDD ET de votre appareil.\n\n` +
      `Cette action est IRRÉVERSIBLE.\n\n` +
      `Continuer ?`
    );
    if (!step1) return;
    const step2 = prompt(
      `Pour confirmer, tapez exactement : VIDER\n` +
      `(en majuscules, sans espaces)`
    );
    if (step2 !== 'VIDER') { alert('Confirmation incorrecte. Aucune modification.'); return; }
    const ok = await clearAll();
    if (ok) alert(`✅ Catalogue vidé. Vous pouvez restaurer un backup ou ajouter de nouvelles voitures.`);
    else    alert(`❌ Erreur lors du vidage. Vérifiez votre connexion.`);
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h2>Gestion des véhicules</h2>
          <p className="subtitle">Ajoutez, modifiez ou retirez les voitures du catalogue.</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-outline"
            onClick={handleClearAll}
            style={{ color: 'var(--rouge-dark, #b91c1c)', borderColor: 'var(--rouge-dark, #b91c1c)' }}
            title="Supprimer toutes les voitures (double confirmation)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" />
            </svg>
            Vider le catalogue
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              const n = importDefaults();
              if (n === 0) alert('Les 15 voitures de base sont déjà importées.');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Importer 15 voitures de base
          </button>
          <button className="btn btn-gold" onClick={handleAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Ajouter un véhicule
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-filter">
            {([
              { v: 'all',      l: 'Tous'        },
              { v: 'dispo',    l: 'Disponibles' },
              { v: 'indispo',  l: 'Indisponibles' },
              { v: 'citadine', l: 'Citadines'   },
              { v: 'suv',      l: 'SUV / 4×4'   },
              { v: 'berline',  l: 'Berlines'    },
            ] as const).map(f => (
              <button
                key={f.v}
                className={`filter-chip ${filter === f.v ? 'active' : ''}`}
                onClick={() => setFilter(f.v as Filter)}
              >
                {f.l}
              </button>
            ))}
          </div>
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ width: 80 }}>Photo</th>
                <th>Véhicule</th>
                <th>Catégorie</th>
                <th>Carburant · Boîte</th>
                <th style={{ textAlign: 'right' }}>Tarifs</th>
                <th>Statut</th>
                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCars.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M14 16H9m10 0h2a2 2 0 0 0 2-2v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1.5 1.5 0 0 0 16.732 5H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></svg>
                    <h3>{cars.length === 0 ? 'Aucun véhicule' : 'Aucun résultat'}</h3>
                    <p>{cars.length === 0 ? 'Commencez par ajouter votre premier véhicule.' : 'Aucune voiture ne correspond.'}</p>
                  </div>
                </td></tr>
              ) : visibleCars.map(car => (
                <tr key={car.id}>
                  <td><div className="car-thumb">{car.photos?.[0] ? <img src={car.photos[0]} alt="" /> : '🚗'}</div></td>
                  <td>
                    <div className="cell-name">
                      <strong>{car.name}</strong>
                      {car.annee && <div className="meta">{car.annee}</div>}
                    </div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{car.category}</td>
                  <td>
                    <div className="cell-name">
                      <strong>{car.carburant}</strong>
                      <div className="meta">{car.boite} · {car.places} places</div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="cell-price">
                      <strong>{car.prix_haut} MAD</strong>
                      <span className="meta">☀️ haute · 🍂 {car.prix_bas}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${car.dispo ? 'badge-dispo' : 'badge-indispo'}`}>
                      {car.dispo ? 'Disponible' : 'Indisponible'}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn-icon-table" title={car.dispo ? 'Marquer indispo' : 'Marquer dispo'} onClick={() => toggleDispo(car.id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {car.dispo
                            ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                            : <polyline points="20 6 9 17 4 12" />}
                        </svg>
                      </button>
                      <button className="btn-icon-table" title="Modifier" onClick={() => handleEdit(car)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button className="btn-icon-table danger" title="Supprimer" onClick={() => handleDelete(car)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} editingCar={editingCar} />
    </div>
  );
}
