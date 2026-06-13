import { useState, useEffect, useMemo } from 'react';
import {
  listInsurances, createInsurance, updateInsurance, deleteInsurance,
  expirationStatus, latestPerVehicle,
  type CreateInsurancePayload,
} from '../services/insurance.service';
import { runAlerts } from '../services/alerts.service';
import { useAuth } from '../contexts/AuthContext';
import type { Insurance } from '../types';

type ViewMode = 'current' | 'all';

export function InsurancePage() {
  const { user } = useAuth();
  const [items,   setItems]   = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [view,    setView]    = useState<ViewMode>('current');
  const [search,  setSearch]  = useState('');
  const [runningAlerts, setRunningAlerts] = useState(false);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing,    setEditing]    = useState<Insurance | null>(null);

  const handleRunAlerts = async () => {
    setRunningAlerts(true);
    try {
      const r = await runAlerts();
      const total = r.insurancesFound + r.visitesFound;
      if (total === 0) {
        alert('🔕 Aucune échéance proche à signaler.\n\nToutes les assurances et visites sont à jour ou ont déjà été notifiées.');
      } else {
        alert(`🔔 Vérification terminée !\n\n${r.insurancesFound} assurance(s) et ${r.visitesFound} visite(s) à venir dans 7 jours.\n\n${r.emailsSent}/${r.recipientCount} email(s) envoyé(s) aux administrateurs.`
              + (r.errors.length > 0 ? `\n\nErreurs : ${r.errors.length}` : ''));
      }
    } catch (e) {
      alert(`❌ ${(e as Error).message}`);
    } finally {
      setRunningAlerts(false);
    }
    void reload();
  };

  const reload = async () => {
    setLoading(true); setError('');
    try { setItems(await listInsurances()); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { void reload(); }, []);

  const visibleItems = useMemo(() => {
    let list = view === 'current' ? latestPerVehicle(items) : items;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(ins =>
        ins.matricule.toLowerCase().includes(q) ||
        ins.marque.toLowerCase().includes(q) ||
        ins.modele.toLowerCase().includes(q) ||
        ins.compagnie.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, view, search]);

  // Stats résumées (sur la dernière police par véhicule)
  const stats = useMemo(() => {
    const current = latestPerVehicle(items);
    const expired = current.filter(i => expirationStatus(i.dateFin).level === 'expired').length;
    const urgent  = current.filter(i => expirationStatus(i.dateFin).level === 'urgent').length;
    const soon    = current.filter(i => expirationStatus(i.dateFin).level === 'soon').length;
    return { total: current.length, expired, urgent, soon };
  }, [items]);

  const handleAdd = () => { setEditing(null); setDrawerOpen(true); };
  const handleEdit = (ins: Insurance) => { setEditing(ins); setDrawerOpen(true); };

  const handleDelete = async (ins: Insurance) => {
    if (!confirm(`Supprimer cette assurance ${ins.compagnie} ?\nVéhicule : ${ins.marque} ${ins.modele} — ${ins.matricule}`)) return;
    try {
      await deleteInsurance(ins.id);
      await reload();
    } catch (e) { alert((e as Error).message); }
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h2>Fins d'assurance</h2>
          <p className="subtitle">Suivi des échéances des polices d'assurance de la flotte.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={handleRunAlerts} disabled={runningAlerts} title="Lance immédiatement la vérification + envoie les emails">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {runningAlerts ? 'Vérification…' : 'Vérifier les échéances'}
          </button>
          <button className="btn btn-gold" onClick={handleAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Nouvelle assurance
          </button>
        </div>
      </div>

      {error && (
        <div className="lf-err show" style={{ marginBottom: '1rem' }}><span>{error}</span></div>
      )}

      <p style={{ fontSize: '.78rem', color: 'var(--gris-500)', marginTop: '-.6rem', marginBottom: '1.1rem' }}>
        💡 Une vérification automatique est planifiée chaque jour à <strong>8h00</strong>. Un email récapitulatif est envoyé à <strong>{user?.email ?? 'votre adresse'}</strong> si une échéance arrive dans les 7 prochains jours.
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '.9rem', marginBottom: '1.2rem' }}>
        <StatCard label="Véhicules couverts" value={stats.total} color="var(--gris-700)" />
        <StatCard label="Expirées"           value={stats.expired} color="var(--rouge-dark, #b91c1c)" />
        <StatCard label="Échéance < 7 j"     value={stats.urgent}  color="#c2410c" />
        <StatCard label="Échéance < 30 j"    value={stats.soon}    color="#a16207" />
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-filter">
            <button className={`filter-chip ${view === 'current' ? 'active' : ''}`} onClick={() => setView('current')}>
              Par véhicule (en cours)
            </button>
            <button className={`filter-chip ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>
              Historique complet ({items.length})
            </button>
          </div>
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Rechercher (matricule, marque, compagnie…)" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Marque · Modèle</th>
                <th>Compagnie</th>
                <th>Période</th>
                <th>Échéance</th>
                <th style={{ textAlign: 'right' }}>Montant</th>
                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="empty-state"><p>Chargement…</p></div></td></tr>
              ) : visibleItems.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <h3>Aucune assurance</h3>
                    <p>Cliquez sur « Nouvelle assurance » pour enregistrer la première police.</p>
                  </div>
                </td></tr>
              ) : visibleItems.map(ins => {
                const st = expirationStatus(ins.dateFin);
                return (
                  <tr key={ins.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '.9rem', fontWeight: 700, letterSpacing: '.04em' }}>
                      {ins.matricule}
                    </td>
                    <td>
                      <strong>{ins.marque}</strong>
                      <div className="meta">{ins.modele}</div>
                    </td>
                    <td>
                      <strong>{ins.compagnie}</strong>
                    </td>
                    <td style={{ fontSize: '.78rem', color: 'var(--gris-700)' }}>
                      du {new Date(ins.dateDebut).toLocaleDateString('fr-FR')}<br />
                      au {new Date(ins.dateFin).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '.2rem .6rem', borderRadius: 10, background: st.bg, color: st.color, fontSize: '.75rem', fontWeight: 600 }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {ins.montantMad ? `${ins.montantMad.toLocaleString('fr-FR')} MAD` : <span style={{ color: 'var(--gris-500)', fontWeight: 400 }}>—</span>}
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn-icon-table" title="Modifier" onClick={() => handleEdit(ins)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button className="btn-icon-table danger" title="Supprimer" onClick={() => handleDelete(ins)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <InsuranceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editing={editing}
        onSaved={async () => { setDrawerOpen(false); await reload(); }}
      />
    </div>
  );
}

// ─── Carte stat ─────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card">
      <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--gris-500)', fontWeight: 600 }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color, marginTop: '.2rem' }}>{value}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Drawer ─────────────────────────────────────
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  editing: Insurance | null;
  onSaved: () => Promise<void>;
}

function InsuranceDrawer({ open, onClose, editing, onSaved }: DrawerProps) {
  const [matricule,  setMatricule]  = useState('');
  const [marque,     setMarque]     = useState('');
  const [modele,     setModele]     = useState('');
  const [compagnie,  setCompagnie]  = useState('');
  const [dateDebut,  setDateDebut]  = useState('');
  const [dateFin,    setDateFin]    = useState('');
  const [montantMad, setMontantMad] = useState('');
  const [notes,      setNotes]      = useState('');
  const [saving,     setSaving]     = useState(false);
  const [err,        setErr]        = useState('');

  useEffect(() => {
    if (open) {
      if (editing) {
        setMatricule(editing.matricule);
        setMarque(editing.marque);
        setModele(editing.modele);
        setCompagnie(editing.compagnie);
        setDateDebut(editing.dateDebut.split('T')[0]);
        setDateFin(editing.dateFin.split('T')[0]);
        setMontantMad(editing.montantMad ? String(editing.montantMad) : '');
        setNotes(editing.notes ?? '');
      } else {
        setMatricule(''); setMarque(''); setModele('');
        setCompagnie('');
        setDateDebut(''); setDateFin('');
        setMontantMad(''); setNotes('');
      }
      setErr('');
    }
  }, [open, editing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      if (editing) {
        await updateInsurance(editing.id, {
          matricule, marque, modele, compagnie, dateDebut, dateFin,
          montantMad: montantMad ? parseInt(montantMad, 10) : null,
          notes: notes || null,
        });
      } else {
        const payload: CreateInsurancePayload = {
          matricule, marque, modele, compagnie, dateDebut, dateFin,
          ...(montantMad ? { montantMad: parseInt(montantMad, 10) } : {}),
          ...(notes ? { notes } : {}),
        };
        await createInsurance(payload);
      }
      await onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const fieldStyle: React.CSSProperties = { width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)' };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer open">
        <div className="drawer-head">
          <h3>{editing ? 'Modifier une assurance' : 'Nouvelle assurance'}</h3>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <form className="drawer-body" onSubmit={handleSave} style={{ display: 'grid', gap: '1rem' }}>
          {err && <div className="lf-err show"><span>{err}</span></div>}

          {/* Véhicule (saisie libre) */}
          <div style={{ paddingBottom: '.5rem', borderBottom: '1px solid var(--gris-200)' }}>
            <div style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--gris-500)', fontWeight: 600, marginBottom: '.6rem' }}>
              Véhicule
            </div>

            <label style={{ fontSize: '.8rem', display: 'block', marginBottom: '.7rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Matricule *</div>
              <input type="text" value={matricule} onChange={e => setMatricule(e.target.value)} required placeholder="ex: 123456-A-7" style={{ ...fieldStyle, fontFamily: 'monospace', letterSpacing: '.04em', fontWeight: 600 }} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
              <label style={{ fontSize: '.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Marque *</div>
                <input type="text" value={marque} onChange={e => setMarque(e.target.value)} required placeholder="Peugeot, Dacia…" style={fieldStyle} />
              </label>
              <label style={{ fontSize: '.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Modèle *</div>
                <input type="text" value={modele} onChange={e => setModele(e.target.value)} required placeholder="208 Allure" style={fieldStyle} />
              </label>
            </div>
          </div>

          {/* Police */}
          <label style={{ fontSize: '.8rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Compagnie *</div>
            <input type="text" value={compagnie} onChange={e => setCompagnie(e.target.value)} required placeholder="ex: AXA, Wafa Assurance…" style={fieldStyle} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
            <label style={{ fontSize: '.8rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Début *</div>
              <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} required style={fieldStyle} />
            </label>
            <label style={{ fontSize: '.8rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Fin (échéance) *</div>
              <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} required style={fieldStyle} />
            </label>
          </div>

          <label style={{ fontSize: '.8rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Montant payé (MAD)</div>
            <input type="number" value={montantMad} onChange={e => setMontantMad(e.target.value)} placeholder="ex: 4500" min={0} style={fieldStyle} />
          </label>

          <label style={{ fontSize: '.8rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Notes (optionnel)</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </label>

          <button type="submit" className="btn btn-gold" disabled={saving} style={{ marginTop: '.5rem' }}>
            {saving ? 'Sauvegarde…' : (editing ? 'Enregistrer' : 'Créer la police')}
          </button>
        </form>
      </aside>
    </>
  );
}
