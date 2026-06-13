import { useState, useEffect, useMemo } from 'react';
import { listLogs, purgeAllLogs } from '../services/audit.service';
import type { AuditLog } from '../types';

type ActionFilter = 'all' | 'car' | 'user' | 'auth';

/** Couleur de badge selon le type d'action. */
function actionStyle(action: string): { bg: string; color: string; label: string } {
  if (action.startsWith('car.'))  return { bg: 'rgba(201,169,110,.18)', color: 'var(--gold-dark)',  label: 'CATALOGUE' };
  if (action.startsWith('user.')) return { bg: 'rgba(59,130,246,.15)',  color: '#1D4ED8',           label: 'COMPTE'    };
  if (action.startsWith('auth.')) return { bg: 'rgba(239,68,68,.15)',   color: 'var(--rouge-dark)', label: 'AUTH'      };
  return                                  { bg: 'rgba(100,116,139,.13)', color: 'var(--gris-700)',  label: 'AUTRE'     };
}

/** Format lisible d'une action. */
function actionLabel(action: string): string {
  const map: Record<string, string> = {
    'car.replaceAll':      'Sync catalogue',
    'car.clear':           'Vidage catalogue',
    'user.create':         'Création compte',
    'user.update':         'Modification compte',
    'user.delete':         'Suppression compte',
    'user.toggle_active':  'Activation/désactivation',
    'user.change_role':    'Changement de rôle',
    'auth.login_failed':   'Connexion échouée',
  };
  return map[action] ?? action;
}

export function AuditPage() {
  const [logs,    setLogs]    = useState<AuditLog[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [filter,  setFilter]  = useState<ActionFilter>('all');
  const [search,  setSearch]  = useState('');

  const reload = async () => {
    setLoading(true); setError('');
    try {
      const r = await listLogs({ limit: 200 });
      setLogs(r.logs);
      setTotal(r.total);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { void reload(); }, []);

  const filteredLogs = useMemo(() => {
    let list = logs;
    if (filter !== 'all') list = list.filter(l => l.action.startsWith(filter + '.'));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.action.toLowerCase().includes(q) ||
        (l.username ?? '').toLowerCase().includes(q) ||
        (l.details ?? '').toLowerCase().includes(q) ||
        (l.ipAddress ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [logs, filter, search]);

  const handlePurge = async () => {
    if (!confirm(`⚠️ VIDER TOUT LE JOURNAL ?\n\nVous allez supprimer DÉFINITIVEMENT ${total} entrée(s) d'audit.\n\nCette action est IRRÉVERSIBLE.`)) return;
    const step2 = prompt('Pour confirmer, tapez : VIDER');
    if (step2 !== 'VIDER') { alert('Confirmation incorrecte. Aucune modification.'); return; }
    try {
      const deleted = await purgeAllLogs();
      alert(`✅ ${deleted} entrée(s) supprimée(s).`);
      await reload();
    } catch (e) { alert((e as Error).message); }
  };

  const formatDetails = (log: AuditLog): string => {
    if (!log.details) return '—';
    try {
      const parsed = JSON.parse(log.details);
      return Object.entries(parsed).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(' · ');
    } catch { return log.details; }
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h2>Journal d'audit</h2>
          <p className="subtitle">Historique complet des actions effectuées par les administrateurs.</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-outline"
            onClick={handlePurge}
            disabled={total === 0}
            style={{ color: 'var(--rouge-dark, #b91c1c)', borderColor: 'var(--rouge-dark, #b91c1c)', opacity: total === 0 ? .4 : 1 }}
            title="Supprimer toutes les entrées du journal (double confirmation)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /></svg>
            Vider le journal
          </button>
        </div>
      </div>

      {error && (
        <div className="lf-err show" style={{ marginBottom: '1rem' }}><span>{error}</span></div>
      )}

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-filter">
            {([
              { v: 'all',  l: `Toutes (${logs.length})` },
              { v: 'car',  l: 'Catalogue' },
              { v: 'user', l: 'Comptes' },
              { v: 'auth', l: 'Authentification' },
            ] as const).map(f => (
              <button
                key={f.v}
                className={`filter-chip ${filter === f.v ? 'active' : ''}`}
                onClick={() => setFilter(f.v)}
              >
                {f.l}
              </button>
            ))}
          </div>
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Rechercher dans les détails…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ width: 160 }}>Date</th>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>Détails</th>
                <th style={{ width: 110 }}>IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><div className="empty-state"><p>Chargement…</p></div></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <h3>Aucune entrée</h3>
                    <p>{logs.length === 0 ? 'Le journal est vide. Effectuez des actions pour générer des logs.' : 'Aucun résultat pour ce filtre.'}</p>
                  </div>
                </td></tr>
              ) : filteredLogs.map(log => {
                const st = actionStyle(log.action);
                return (
                  <tr key={log.id}>
                    <td style={{ fontSize: '.78rem', color: 'var(--gris-700)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td>
                      {log.user
                        ? <><strong>{log.user.firstName} {log.user.lastName}</strong>
                            <div className="meta">@{log.user.username} · {log.user.role === 'SUPER_ADMIN' ? '★ Super Admin' : 'Admin'}</div>
                          </>
                        : log.username
                          ? <><strong style={{ color: 'var(--gris-500)' }}>@{log.username}</strong>
                              <div className="meta">(compte supprimé ou inexistant)</div>
                            </>
                          : <span style={{ color: 'var(--gris-500)' }}>—</span>
                      }
                    </td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '.15rem .55rem', borderRadius: 10, background: st.bg, color: st.color, fontSize: '.7rem', fontWeight: 600, letterSpacing: '.04em', marginRight: '.4rem' }}>
                        {st.label}
                      </span>
                      <div style={{ fontSize: '.85rem', marginTop: '.2rem' }}>{actionLabel(log.action)}</div>
                    </td>
                    <td style={{ fontSize: '.78rem', color: 'var(--gris-700)', wordBreak: 'break-all' }}>
                      {formatDetails(log)}
                    </td>
                    <td style={{ fontSize: '.75rem', color: 'var(--gris-500)', whiteSpace: 'nowrap' }}>
                      {log.ipAddress ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
