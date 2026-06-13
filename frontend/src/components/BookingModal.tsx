import { useState, useEffect } from 'react';
import type { Car } from '../types/car';
import { computePrice, getSeasonLabel } from '../utils/pricing';
import { compressImage, isAcceptableSize } from '../utils/imageCompression';
import { submitBooking } from '../services/bookings.service';

interface Props { car: Car | null; onClose: () => void; }

type Pickup = 'Agence Oujda' | 'Aéroport Oujda-Angad' | 'Hôtel / Adresse';
type State = 'idle' | 'sending' | 'success' | 'error';

/**
 * BookingModal — Reproduction exacte du design legacy (.modal-overlay + .luxe-*).
 * Toutes les classes CSS utilisées sont celles de styles/legacy.css.
 */
export function BookingModal({ car, onClose }: Props) {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [lieu, setLieu] = useState<Pickup | ''>('');
  const [notes, setNotes] = useState('');
  const [recto, setRecto] = useState<File | null>(null);
  const [verso, setVerso] = useState<File | null>(null);
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!car) return;
    setPrenom(''); setNom(''); setEmail(''); setTel('');
    setDebut(''); setFin(''); setLieu(''); setNotes('');
    setRecto(null); setVerso(null);
    setState('idle'); setErrorMsg('');
  }, [car]);

  useEffect(() => {
    if (!car) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [car]);

  if (!car) return null;

  const today = new Date().toISOString().split('T')[0];
  const breakdown = computePrice(car, debut, fin);
  const seasonLabel = getSeasonLabel(debut, fin);

  const handleFile = (which: 'recto' | 'verso') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!isAcceptableSize(f)) { alert('Fichier trop volumineux (max 5 Mo).'); return; }
    (which === 'recto' ? setRecto : setVerso)(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lieu) { alert('Choisissez un lieu de prise en charge.'); return; }
    setState('sending'); setErrorMsg('');
    try {
      const rectoFinal = recto ? await compressImage(recto) : undefined;
      const versoFinal = verso ? await compressImage(verso) : undefined;
      const r = await submitBooking({
        vehicle: car.name,
        prenom, nom, email, tel, debut, fin, lieu, notes,
        saison: seasonLabel,
        total:  breakdown ? String(breakdown.total) : '',
        jours:  breakdown ? `${breakdown.totalJours} jour(s)` : '',
        permis_recto: rectoFinal,
        permis_verso: versoFinal,
      });
      if (!r.success) throw new Error(r.message ?? 'Erreur serveur');
      setState('success');
    } catch (err) { setErrorMsg((err as Error).message); setState('error'); }
  };

  return (
    <div className="modal-overlay open" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-wrap">
        <div className="modal" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>

          {/* Image */}
          <div className="modal-gallery">
            {car.photos?.[0] ? (
              <img src={car.photos[0]} alt={car.name} />
            ) : (
              <div className="gallery-ph">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>Aucune photo</span>
              </div>
            )}
          </div>

          <div className="modal-body">
            <div className="section-label">{car.badge ?? car.category}</div>
            <div className="modal-car-name">{car.name}</div>
            {car.desc && <p style={{ color: 'var(--gris)', fontSize: '.86rem', marginBottom: '.6rem' }}>{car.desc}</p>}

            {/* Prix saison */}
            <div className="modal-price-grid">
              <div className="modal-price-box mpb-haut">
                <div className="mpb-season">☀️ Haute saison</div>
                <div className="mpb-val">{car.prix_haut}</div>
                <div className="mpb-unit">MAD / jour</div>
              </div>
              <div className="modal-price-box mpb-bas">
                <div className="mpb-season">🍂 Basse saison</div>
                <div className="mpb-val">{car.prix_bas}</div>
                <div className="mpb-unit">MAD / jour</div>
              </div>
            </div>

            {/* Specs */}
            <div className="modal-specs-grid">
              <div className="modal-spec">
                <span className="modal-spec-val">{car.carburant}</span>
                <span className="modal-spec-label">Carburant</span>
              </div>
              <div className="modal-spec">
                <span className="modal-spec-val">{car.boite}</span>
                <span className="modal-spec-label">Boîte</span>
              </div>
              <div className="modal-spec">
                <span className="modal-spec-val">{car.places} places</span>
                <span className="modal-spec-label">Capacité</span>
              </div>
            </div>

            {/* Formulaire luxe */}
            {state === 'success' ? (
              <div className="luxe-success show">
                <div className="luxe-success-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4>Demande transmise</h4>
                <p>Merci ! Notre équipe vous contactera sous <strong>2 heures</strong> pour confirmer votre réservation.</p>
              </div>
            ) : (
              <form className="luxe-form" onSubmit={handleSubmit} noValidate>
                <div className="luxe-form-header">
                  <div className="luxe-eyebrow">Réservation</div>
                  <h3 className="luxe-title">Réservez votre <em>véhicule</em></h3>
                  <p className="luxe-sub">Notre équipe vous recontacte sous 2 heures pour confirmer votre location.</p>
                </div>

                {/* Section I — Dates */}
                <div className="luxe-section">
                  <div className="luxe-section-label"><span className="num">I</span><span>Vos dates</span></div>
                  <div className="luxe-grid">
                    <div className="luxe-field">
                      <input type="date" value={debut} min={today} onChange={e => setDebut(e.target.value)} placeholder=" " required />
                      <label>Date de début *</label>
                    </div>
                    <div className="luxe-field">
                      <input type="date" value={fin} min={debut || today} onChange={e => setFin(e.target.value)} placeholder=" " required />
                      <label>Date de fin *</label>
                    </div>
                  </div>
                </div>

                {/* Section II — Coordonnées */}
                <div className="luxe-section">
                  <div className="luxe-section-label"><span className="num">II</span><span>Vos coordonnées</span></div>
                  <div className="luxe-grid">
                    <div className="luxe-field">
                      <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder=" " required />
                      <label>Prénom *</label>
                    </div>
                    <div className="luxe-field">
                      <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder=" " required />
                      <label>Nom *</label>
                    </div>
                    <div className="luxe-field">
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder=" " required />
                      <label>E-mail *</label>
                    </div>
                    <div className="luxe-field">
                      <input type="tel" value={tel} onChange={e => setTel(e.target.value)} placeholder=" " required />
                      <label>Téléphone *</label>
                    </div>
                  </div>
                </div>

                {/* Section III — Lieu */}
                <div className="luxe-section">
                  <div className="luxe-section-label"><span className="num">III</span><span>Lieu de prise en charge</span></div>
                  <div className="luxe-pickup">
                    <PickupLabel
                      title="Agence" sub="80 Bd Rahmouni, Oujda"
                      selected={lieu === 'Agence Oujda'} onClick={() => setLieu('Agence Oujda')}
                      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" /><path d="M9 9h.01M9 12h.01M9 15h.01M9 18h.01" /></svg>}
                    />
                    <PickupLabel
                      title="Aéroport" sub="Oujda-Angad (OUD)"
                      selected={lieu === 'Aéroport Oujda-Angad'} onClick={() => setLieu('Aéroport Oujda-Angad')}
                      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></svg>}
                    />
                    <PickupLabel
                      title="Hôtel" sub="Livraison à votre adresse"
                      selected={lieu === 'Hôtel / Adresse'} onClick={() => setLieu('Hôtel / Adresse')}
                      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}
                    />
                  </div>
                </div>

                {/* Section IV — Permis */}
                <div className="luxe-section">
                  <div className="luxe-section-label"><span className="num">IV</span><span>Permis de conduire</span></div>
                  <div className="luxe-permis">
                    <PermisBox label="Recto" file={recto} onChange={handleFile('recto')} />
                    <PermisBox label="Verso" file={verso} onChange={handleFile('verso')} />
                  </div>
                  <p style={{ fontSize: '.72rem', color: 'var(--gris)', marginTop: '.6rem', fontStyle: 'italic' }}>
                    Optionnel — vous pouvez aussi nous l'envoyer plus tard par WhatsApp.
                  </p>
                </div>

                {/* Section V — Notes */}
                <div className="luxe-section">
                  <div className="luxe-section-label"><span className="num">V</span><span>Notes &amp; demandes spéciales</span></div>
                  <div className="luxe-field">
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder=" " />
                    <label>Siège bébé, GPS, livraison hôtel, vol d'arrivée…</label>
                  </div>
                </div>

                {/* Section VI — Récap */}
                {breakdown && (
                  <div className="luxe-section">
                    <div className="luxe-section-label"><span className="num">VI</span><span>Récapitulatif</span></div>
                    <div className="luxe-total">
                      <div className="luxe-total-top">
                        <span className="luxe-total-veh">{car.name}</span>
                      </div>
                      <div className="luxe-total-rows">
                        {breakdown.joursHaut > 0 && (
                          <div className="luxe-total-row">
                            <span>☀️ Haute saison — {breakdown.joursHaut} j × {car.prix_haut} MAD</span>
                            <strong>{breakdown.montantHaut.toLocaleString('fr-FR')} MAD</strong>
                          </div>
                        )}
                        {breakdown.joursBas > 0 && (
                          <div className="luxe-total-row">
                            <span>🍂 Basse saison — {breakdown.joursBas} j × {car.prix_bas} MAD</span>
                            <strong>{breakdown.montantBas.toLocaleString('fr-FR')} MAD</strong>
                          </div>
                        )}
                      </div>
                      <div className="luxe-total-divider"></div>
                      <div className="luxe-total-final">
                        <span className="luxe-total-final-label">Total estimé</span>
                        <div>
                          <span className="luxe-total-final-val">{breakdown.total.toLocaleString('fr-FR')}</span>
                          <span className="luxe-total-final-unit">MAD</span>
                        </div>
                      </div>
                      <div className="luxe-total-note">* Tarif indicatif. Prix confirmé par notre équipe sous 2h.</div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="luxe-submit-area">
                  <p className="luxe-privacy">Vos données sont traitées exclusivement par Benroubi Car (RGPD). Aucun engagement à ce stade.</p>
                  {state === 'error' && (
                    <p style={{ color: '#DC2626', fontSize: '.85rem', textAlign: 'center', marginBottom: '.8rem' }}>
                      ❌ {errorMsg || 'Erreur, réessayez.'}
                    </p>
                  )}
                  <button type="submit" className="luxe-submit" disabled={state === 'sending'}>
                    {state === 'sending' ? (
                      <span>Envoi en cours…</span>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                        <span>Envoyer ma demande</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PickupLabel({
  title, sub, icon, selected, onClick,
}: { title: string; sub: string; icon: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <label className={`pickup-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <input type="radio" name="lieu" checked={selected} onChange={onClick} />
      <span className="pc-icon">{icon}</span>
      <span className="pc-text">
        <span className="pc-title">{title}</span>
        <span className="pc-sub">{sub}</span>
      </span>
      <span className="pc-check">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    </label>
  );
}

function PermisBox({
  label, file, onChange,
}: { label: string; file: File | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const isPdf = file?.type === 'application/pdf';
  const isImg = file && file.type.startsWith('image/');
  const previewUrl = isImg ? URL.createObjectURL(file) : null;
  const cls = `permis-box ${isImg ? 'has-file' : ''} ${isPdf ? 'has-pdf' : ''}`;
  return (
    <label className={cls}>
      <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={onChange} />
      <svg className="pb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="6" width="18" height="13" rx="1" />
        <circle cx="8.5" cy="11.5" r="1.5" />
        <path d="M21 16l-5-5L5 19" />
      </svg>
      <span className="pb-label">{label}</span>
      <span className="pb-hint">JPG / PNG / PDF — max 5 Mo</span>
      {previewUrl && <img className="permis-preview" src={previewUrl} alt={label} />}
      {isPdf && <span className="permis-pdf-name">📄 {file.name}</span>}
    </label>
  );
}
