import { useState, useEffect, useMemo } from 'react';
import {
  listVisites, createVisite, updateVisite, deleteVisite,
  expirationStatus, latestPerVehicle,
  type CreateVisitePayload,
} from '../services/visite.service';
import { runAlerts } from '../services/alerts.service';
import { useAuth } from '../contexts/AuthContext';
import type { VisiteTechnique, ResultatVT } from '../types';

type ViewMode = 'current' | 'all';
const RESULTATS: ResultatVT[] = ['Favorable', 'Défavorable', 'Contre-visite'];

function resultatStyle(r: string | null): { bg: string; color: string } {
  if (r === 'Favorable')      return { bg: 'rgba(16,185,129,.15)', color: 'var(--vert-dark, #047857)' };
  if (r === 'Défavorable')    return { bg: 'rgba(239,68,68,.15)',  color: 'var(--rouge-dark, #b91c1c)' };
  if (r === 'Contre-visite')  return { bg: 'rgba(249,115,22,.18)', color: '#c2410c' };
  return                            { bg: 'rgba(100,116,139,.13)', color: 'var(--gris-500)' };
}

export function VisitesPage() {
  const { user } = useAuth();
  const [items,   setItems]   = useState<VisiteTechnique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [view,    setView]    = useState<ViewMode>('current');
  const [search,  setSearch]  = useState('');
  const [runningAlerts, setRunningAlerts] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing,    setEditing]    = useState<VisiteTechnique | null>(null);

  const handleRunAlerts = async () => {
    setRunningAlerts(true);
    try {
      const r = await runAlerts();
      const total = r.insurancesFound + r.visitesFound;
      if (total === 0) {
        alert('🔕 Aucune échéance proche à signaler.');
      } else {
        alert(`🔔 ${r.insurancesFound} assurance(s) + ${r.visitesFound} visite(s) dans les 7 prochains jours.\n${r.emailsSent}/${r.recipientCount} email(s) envoyé(s).`);
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
    try { setItems(await listVisites()); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { void reload(); }, []);

  const visibleItems = useMemo(() => {
    let list = view === 'current' ? latestPerVehicle(items) : items;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.matricule.toLowerCase().includes(q) ||
        v.marque.toLowerCase().includes(q) ||
        v.modele.toLowerCase().includes(q) ||
        v.centre.toLowerCase().includes(q) ||
        (v.resultat ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, view, search]);

  const stats = useMemo(() => {
    const current = latestPerVehicle(items);
    const expired = current.filter(i => expirationStatus(i.dateExpiration).level === 'expired').length;
    const urgent  = current.filter(i => expirationStatus(i.dateExpiration).level === 'urgent').length;
    const soon    = current.filter(i => expirationStatus(i.dateExpiration).level === 'soon').length;
    return { total: current.length, expired, urgent, soon };
  }, [items]);

  const handleAdd  = () => { setEditing(null); setDrawerOpen(true); };
  const handleEdit = (v: VisiteTechnique) => { setEditing(v); setDrawerOpen(true); };
  const handleDelete = async (v: VisiteTechnique) => {
    if (!confirm(`Supprimer cette visite (${v.centre}) ?\nVéhicule : ${v.marque} ${v.modele} — ${v.matricule}`)) return;
    try { await deleteVisite(v.id); await reload(); }
    catch (e) { alert((e as Error).message); }
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h2>Fins de visite technique</h2>
          <p className="subtitle">Suivi des échéances des contrôles techniques de la flotte.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={handleRunAlerts} disabled={runningAlerts}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {runningAlerts ? 'Vérification…' : 'Vérifier les échéances'}
          </button>
          <button className="btn btn-gold" onClick={handleAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Nouvelle visite
          </button>
        </div>
      </div>

      {error && <div className="lf-err show" style={{ marginBottom: '1rem' }}><span>{error}</span></div>}

      <p style={{ fontSize: '.78rem', color: 'var(--gris-500)', marginTop: '-.6rem', marginBottom: '1.1rem' }}>
        💡 Vérification automatique chaque jour à <strong>8h00</strong>. Email envoyé à <strong>{user?.email ?? 'votre adresse'}</strong> si une échéance arrive dans les 7 prochains jours.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '.9rem', marginBottom: '1.2rem' }}>
        <StatCard label="Véhicules contrôlés" value={stats.total}  color="var(--gris-700)" />
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
            <input type="text" placeholder="Rechercher (matricule, marque, centre…)" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Marque · Modèle</th>
                <th>Centre</th>
                <th>Date visite</th>
                <th>Échéance</th>
                <th>Résultat</th>
                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="empty-state"><p>Chargement…</p></div></td></tr>
              ) : visibleItems.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <h3>Aucune visite technique</h3>
                    <p>Cliquez sur « Nouvelle visite » pour enregistrer le premier contrôle.</p>
                  </div>
                </td></tr>
              ) : visibleItems.map(v => {
                const st = expirationStatus(v.dateExpiration);
                const rSt = resultatStyle(v.resultat);
                return (
                  <tr key={v.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '.9rem', fontWeight: 700, letterSpacing: '.04em' }}>{v.matricule}</td>
                    <td>
                      <strong>{v.marque}</strong>
                      <div className="meta">{v.modele}</div>
                    </td>
                    <td>{v.centre}</td>
                    <td style={{ fontSize: '.85rem' }}>{new Date(v.dateVisite).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div style={{ fontSize: '.8rem', marginBottom: '.2rem' }}>{new Date(v.dateExpiration).toLocaleDateString('fr-FR')}</div>
                      <span style={{ display: 'inline-block', padding: '.15rem .55rem', borderRadius: 10, background: st.bg, color: st.color, fontSize: '.7rem', fontWeight: 600 }}>
                        {st.label}
                      </span>
                    </td>
                    <td>
                      {v.resultat
                        ? <span style={{ display: 'inline-block', padding: '.15rem .55rem', borderRadius: 10, background: rSt.bg, color: rSt.color, fontSize: '.7rem', fontWeight: 600 }}>{v.resultat}</span>
                        : <span style={{ color: 'var(--gris-500)' }}>—</span>}
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn-icon-table" title="Modifier" onClick={() => handleEdit(v)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button className="btn-icon-table danger" title="Supprimer" onClick={() => handleDelete(v)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /></svg>
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

      <VisiteDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} editing={editing} onSaved={async () => { setDrawerOpen(false); await reload(); }} />
    </div>
  );
}

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

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  editing: VisiteTechnique | null;
  onSaved: () => Promise<void>;
}

function VisiteDrawer({ open, onClose, editing, onSaved }: DrawerProps) {
  const [matricule,      setMatricule]      = useState('');
  const [marque,         setMarque]         = useState('');
  const [modele,         setModele]         = useState('');
  const [centre,         setCentre]         = useState('');
  const [dateVisite,     setDateVisite]     = useState('');
  const [dateExpiration, setDateExpiration] = useState('');
  const [resultat,       setResultat]       = useState<ResultatVT | ''>('');
  const [notes,          setNotes]          = useState('');
  const [saving,         setSaving]         = useState(false);
  const [err,            setErr]            = useState('');

  useEffect(() => {
    if (open) {
      if (editing) {
        setMatricule(editing.matricule);
        setMarque(editing.marque);
        setModele(editing.modele);
        setCentre(editing.centre);
        setDateVisite(editing.dateVisite.split('T')[0]);
        setDateExpiration(editing.dateExpiration.split('T')[0]);
        setResultat((editing.resultat as ResultatVT) ?? '');
        setNotes(editing.notes ?? '');
      } else {
        setMatricule(''); setMarque(''); setModele('');
        setCentre('');
        setDateVisite(''); setDateExpiration('');
        setResultat(''); setNotes('');
      }
      setErr('');
    }
  }, [open, editing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const payload: CreateVisitePayload = {
        matricule, marque, modele, centre, dateVisite, dateExpiration,
        ...(resultat ? { resultat: resultat as ResultatVT } : {}),
        ...(notes ? { notes } : {}),
      };
      if (editing) {
        await updateVisite(editing.id, {
          ...payload,
          resultat: resultat || null,
          notes: notes || null,
        });
      } else {
        await createVisite(payload);
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
          <h3>{editing ? 'Modifier une visite' : 'Nouvelle visite technique'}</h3>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <form className="drawer-body" onSubmit={handleSave} style={{ display: 'grid', gap: '1rem' }}>
          {err && <div className="lf-err show"><span>{err}</span></div>}

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
                <input type="text" value={marque} onChange={e => setMarque(e.target.value)} required placeholder="Peugeot…" style={fieldStyle} />
              </label>
              <label style={{ fontSize: '.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Modèle *</div>
                <input type="text" value={modele} onChange={e => setModele(e.target.value)} required placeholder="208 Allure" style={fieldStyle} />
              </label>
            </div>
          </div>

          <label style={{ fontSize: '.8rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Centre de contrôle *</div>
            <input type="text" value={centre} onChange={e => setCentre(e.target.value)} required placeholder="ex: Norisko Oujda, DEKRA Maroc…" style={fieldStyle} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
            <label style={{ fontSize: '.8rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Date visite *</div>
              <input type="date" value={dateVisite} onChange={e => setDateVisite(e.target.value)} required style={fieldStyle} />
            </label>
            <label style={{ fontSize: '.8rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Date expiration *</div>
              <input type="date" value={dateExpiration} onChange={e => setDateExpiration(e.target.value)} required style={fieldStyle} />
            </label>
          </div>

          <div>
            <div style={{ fontWeight: 600, marginBottom: '.4rem', fontSize: '.8rem' }}>Résultat</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              <button type="button" onClick={() => setResultat('')} className={`filter-chip ${resultat === '' ? 'active' : ''}`}>—</button>
              {RESULTATS.map(r => (
                <button key={r} type="button" onClick={() => setResultat(r)} className={`filter-chip ${resultat === r ? 'active' : ''}`}>{r}</button>
              ))}
            </div>
          </div>

          <label style={{ fontSize: '.8rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Notes (optionnel)</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </label>

          <button type="submit" className="btn btn-gold" disabled={saving} style={{ marginTop: '.5rem' }}>
            {saving ? 'Sauvegarde…' : (editing ? 'Enregistrer' : 'Créer la visite')}
          </button>
        </form>
      </aside>
    </>
  );
}
