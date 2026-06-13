import { useState, useEffect } from 'react';
import { useCars } from '../contexts/CarsContext';
import type { Car, CarCategory } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  editingCar: Car | null;
}

const CATEGORIES: { value: CarCategory; label: string }[] = [
  { value: 'citadine',   label: 'Citadine'   },
  { value: 'berline',    label: 'Berline'    },
  { value: 'suv',        label: 'SUV / 4×4'  },
  { value: 'utilitaire', label: 'Utilitaire' },
  { value: 'premium',    label: 'Premium'    },
];

const FUELS = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'];

function badgeFromCategory(cat: CarCategory): string {
  const map: Record<CarCategory, string> = {
    citadine:   'Citadine',
    berline:    'Berline',
    suv:        'SUV / 4×4',
    utilitaire: 'Utilitaire',
    premium:    'Premium',
  };
  return map[cat] ?? cat;
}

export function CarDrawer({ open, onClose, editingCar }: Props) {
  const { addCar, updateCar } = useCars();

  const [marque,    setMarque]    = useState('');
  const [modele,    setModele]    = useState('');
  const [annee,     setAnnee]     = useState('');
  const [matricule, setMatricule] = useState('');
  const [category,  setCategory]  = useState<CarCategory | ''>('');
  const [carburant, setCarburant] = useState('');
  const [boite,     setBoite]     = useState('');
  const [places,    setPlaces]    = useState('5');
  const [prixHaut,  setPrixHaut]  = useState('');
  const [prixBas,   setPrixBas]   = useState('');
  const [desc,      setDesc]      = useState('');
  const [dispo,     setDispo]     = useState(true);
  const [photos,    setPhotos]    = useState<string[]>([]);

  // Charge les données du véhicule à éditer
  useEffect(() => {
    if (!open) return;
    if (editingCar) {
      // Édition : split name en marque + modele si besoin
      let m = editingCar.marque, mo = editingCar.modele;
      if ((!m || !mo) && editingCar.name) {
        const parts = editingCar.name.split(' ');
        m = parts[0];
        mo = parts.slice(1).join(' ');
      }
      setMarque(m ?? '');
      setModele(mo ?? '');
      setAnnee(editingCar.annee ?? '');
      setMatricule(editingCar.matricule ?? '');
      setCategory(editingCar.category);
      setCarburant(editingCar.carburant);
      setBoite(editingCar.boite);
      setPlaces(String(editingCar.places));
      setPrixHaut(String(editingCar.prix_haut));
      setPrixBas(String(editingCar.prix_bas));
      setDesc(editingCar.desc ?? '');
      setDispo(editingCar.dispo);
      setPhotos(editingCar.photos ?? []);
    } else {
      // Création : reset
      setMarque(''); setModele(''); setAnnee(''); setMatricule(''); setCategory('');
      setCarburant(''); setBoite(''); setPlaces('5');
      setPrixHaut(''); setPrixBas(''); setDesc(''); setDispo(true);
      setPhotos([]);
    }
  }, [open, editingCar]);

  // ─── Photos drag&drop / upload ─────────────────
  const handlePhotos = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`"${file.name}" trop volumineux (>5 Mo)`);
        return;
      }
      const r = new FileReader();
      r.onload = e => {
        if (typeof e.target?.result === 'string') {
          setPhotos(p => [...p, e.target!.result as string]);
        }
      };
      r.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => setPhotos(p => p.filter((_, i) => i !== idx));

  // ─── Save ────────────────────────────────────────
  const handleSave = () => {
    if (!marque || !modele || !category || !carburant || !boite || !prixHaut || !prixBas) {
      alert('Remplissez les champs obligatoires (*)');
      return;
    }
    const prixH = parseInt(prixHaut, 10);
    const prixB = parseInt(prixBas, 10);
    if (prixB > prixH) {
      alert('Le prix basse saison doit être ≤ au prix haute saison.');
      return;
    }

    const name = marque + ' ' + modele + (annee ? ' ' + annee : '');
    const data = {
      name, marque, modele, annee,
      matricule: matricule.trim() || undefined,
      category: category as CarCategory,
      badge: badgeFromCategory(category as CarCategory),
      carburant, boite,
      places: parseInt(places, 10) || 5,
      prix_haut: prixH,
      prix_bas:  prixB,
      desc: desc || `${marque} ${modele} — ${carburant}, ${boite}, ${places} places.`,
      photos: [...photos],
      dispo,
    };

    if (editingCar) {
      updateCar(editingCar.id, data);
    } else {
      addCar(data);
    }
    onClose();
  };

  return (
    <>
      <div className={`drawer-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-head">
          <h3>{editingCar ? 'Modifier le véhicule' : 'Nouveau véhicule'}</h3>
          <button className="btn-close-drawer" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="drawer-body">
          {/* Identité */}
          <div className="form-section">
            <div className="form-section-title">Identité du véhicule</div>
            <div className="form-row">
              <Field label="Marque" required value={marque} onChange={setMarque} placeholder="Peugeot, Dacia…" />
              <Field label="Modèle" required value={modele} onChange={setModele} placeholder="208 Allure" />
            </div>
            <div className="form-row">
              <Field label="Année" type="number" value={annee} onChange={setAnnee} placeholder="2023" />
              <Field label="Matricule" value={matricule} onChange={setMatricule} placeholder="123456-A-7" />
            </div>
            <div className="form-row">
              <SelectField
                label="Catégorie" required
                value={category} onChange={v => setCategory(v as CarCategory)}
                options={[{ value: '', label: 'Choisir…' }, ...CATEGORIES.map(c => ({ value: c.value, label: c.label }))]}
              />
              <div /> {/* col vide pour alignement */}
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="form-section">
            <div className="form-section-title">Caractéristiques</div>
            <div className="form-row three">
              <SelectField
                label="Carburant" required
                value={carburant} onChange={setCarburant}
                options={[{ value: '', label: '…' }, ...FUELS.map(f => ({ value: f, label: f }))]}
              />
              <SelectField
                label="Boîte" required
                value={boite} onChange={setBoite}
                options={[{ value: '', label: '…' }, { value: 'Manuelle', label: 'Manuelle' }, { value: 'Automatique', label: 'Automatique' }]}
              />
              <SelectField
                label="Places"
                value={places} onChange={setPlaces}
                options={['2', '4', '5', '7', '9'].map(v => ({ value: v, label: v }))}
              />
            </div>
          </div>

          {/* Tarifs */}
          <div className="form-section">
            <div className="form-section-title">Tarifs saisonniers</div>
            <div className="form-row">
              <div className="field">
                <label>Haute saison ☀️ <span className="req">*</span></label>
                <div className="input-suffix" data-suffix="MAD/j">
                  <input type="number" value={prixHaut} onChange={e => setPrixHaut(e.target.value)} placeholder="500" min={1} />
                </div>
              </div>
              <div className="field">
                <label>Basse saison 🍂 <span className="req">*</span></label>
                <div className="input-suffix" data-suffix="MAD/j">
                  <input type="number" value={prixBas} onChange={e => setPrixBas(e.target.value)} placeholder="350" min={1} />
                </div>
              </div>
            </div>
            <p style={{ fontSize: '.72rem', color: 'var(--gris-500)', marginTop: '-.4rem', fontStyle: 'italic' }}>
              Haute saison : Juin–Août. Basse saison : Septembre–Mai.
            </p>
          </div>

          {/* Dispo */}
          <div className="form-section">
            <div className="form-section-title">Disponibilité</div>
            <div className="toggle-pill">
              <input type="radio" id="dispo-on" checked={dispo} onChange={() => setDispo(true)} />
              <label htmlFor="dispo-on" className="green">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                Disponible à la location
              </label>
              <input type="radio" id="dispo-off" checked={!dispo} onChange={() => setDispo(false)} />
              <label htmlFor="dispo-off" className="red">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                Non disponible
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <div className="form-section-title">Description</div>
            <div className="field">
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Idéal pour les longs trajets…" />
            </div>
          </div>

          {/* Photos */}
          <div className="form-section">
            <div className="form-section-title">Photos</div>
            <label className="photo-upload">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={e => handlePhotos(e.target.files)}
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              <p>Glissez vos photos ici ou <strong>cliquez pour parcourir</strong></p>
              <span className="hint">JPG · PNG · WEBP — max 5 Mo par photo · la 1ère sera la couverture</span>
            </label>
            {photos.length > 0 && (
              <div className="photos-grid">
                {photos.map((src, i) => (
                  <div key={i} className={`photo-thumb ${i === 0 ? 'cover' : ''}`}>
                    <img src={src} alt="" />
                    <button className="del" onClick={() => removePhoto(i)} title="Supprimer">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="drawer-foot">
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-gold" onClick={handleSave}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            Enregistrer
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Sous-composants form ─────────────────────────
function Field({
  label, required = false, value, onChange, type = 'text', placeholder,
}: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div className="field">
      <label>{label} {required && <span className="req">*</span>}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function SelectField({
  label, required = false, value, onChange, options,
}: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="field">
      <label>{label} {required && <span className="req">*</span>}</label>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}
