import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { listUsers, createUser, updateUser, deleteUser, type CreateUserPayload } from '../services/users.service';
import type { User, Role } from '../types';

export function UsersPage() {
  const { user: me } = useAuth();
  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing,    setEditing]    = useState<User | null>(null);

  const reload = async () => {
    setLoading(true); setError('');
    try { setUsers(await listUsers()); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { void reload(); }, []);

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.username.includes(q) || u.email.includes(q) || u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q);
  });

  const handleAdd = () => { setEditing(null); setDrawerOpen(true); };
  const handleEdit = (u: User) => { setEditing(u); setDrawerOpen(true); };

  const handleToggleActive = async (u: User) => {
    if (u.id === me?.id) { alert('Vous ne pouvez pas vous désactiver vous-même.'); return; }
    if (!confirm(`${u.active ? 'Désactiver' : 'Réactiver'} le compte de ${u.firstName} ${u.lastName} ?`)) return;
    try {
      await updateUser(u.id, { active: !u.active });
      await reload();
    } catch (e) { alert((e as Error).message); }
  };

  const handleDelete = async (u: User) => {
    if (u.id === me?.id) { alert('Vous ne pouvez pas supprimer votre propre compte.'); return; }
    if (!confirm(`Supprimer DÉFINITIVEMENT le compte de ${u.firstName} ${u.lastName} ?\nCette action est irréversible.`)) return;
    try {
      await deleteUser(u.id);
      await reload();
    } catch (e) { alert((e as Error).message); }
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h2>Gestion des comptes</h2>
          <p className="subtitle">Créez, modifiez et supprimez les comptes administrateurs.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-gold" onClick={handleAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Nouveau compte
          </button>
        </div>
      </div>

      {error && (
        <div className="lf-err show" style={{ marginBottom: '1rem' }}><span>{error}</span></div>
      )}

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-filter" style={{ fontSize: '.85rem', color: 'var(--gris-700)' }}>
            <strong>{users.length}</strong> compte{users.length > 1 ? 's' : ''} ·{' '}
            <strong>{users.filter(u => u.role === 'SUPER_ADMIN').length}</strong> Super Admin ·{' '}
            <strong>{users.filter(u => u.active).length}</strong> actif{users.filter(u => u.active).length > 1 ? 's' : ''}
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
                <th>Nom complet</th>
                <th>Username</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Dernière connexion</th>
                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="empty-state"><p>Chargement…</p></div></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><h3>Aucun compte</h3><p>Cliquez sur « Nouveau compte » pour créer un administrateur.</p></div></td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.firstName} {u.lastName}</strong>{u.id === me?.id && <span style={{ color: 'var(--gold-dark)', fontSize: '.7rem', marginLeft: '.5rem' }}>(vous)</span>}</td>
                  <td style={{ color: 'var(--gris-700)' }}>@{u.username}</td>
                  <td style={{ color: 'var(--gris-700)', fontSize: '.85rem' }}>{u.email}</td>
                  <td>
                    <span style={{ display: 'inline-block', padding: '.15rem .55rem', borderRadius: 10,
                        background: u.role === 'SUPER_ADMIN' ? 'rgba(201,169,110,.18)' : 'rgba(100,116,139,.13)',
                        color:      u.role === 'SUPER_ADMIN' ? 'var(--gold-dark)'      : 'var(--gris-700)',
                        fontSize: '.7rem', fontWeight: 600, letterSpacing: '.04em' }}>
                      {u.role === 'SUPER_ADMIN' ? '★ SUPER ADMIN' : 'ADMIN'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.active ? 'badge-dispo' : 'badge-indispo'}`}>
                      {u.active ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td style={{ fontSize: '.78rem', color: 'var(--gris-500)' }}>
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn-icon-table" title={u.active ? 'Désactiver' : 'Réactiver'} onClick={() => handleToggleActive(u)} disabled={u.id === me?.id}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {u.active
                            ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                            : <polyline points="20 6 9 17 4 12" />}
                        </svg>
                      </button>
                      <button className="btn-icon-table" title="Modifier" onClick={() => handleEdit(u)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button className="btn-icon-table danger" title="Supprimer" onClick={() => handleDelete(u)} disabled={u.id === me?.id}>
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

      <UserDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editing={editing}
        onSaved={async () => { setDrawerOpen(false); await reload(); }}
      />
    </div>
  );
}

// ─── Drawer de création / édition ─────────────────────
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  editing: User | null;
  onSaved: () => Promise<void>;
}

function UserDrawer({ open, onClose, editing, onSaved }: DrawerProps) {
  const [username,  setUsername]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [role,      setRole]      = useState<Role>('ADMIN');
  const [active,    setActive]    = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState('');

  useEffect(() => {
    if (open) {
      if (editing) {
        setUsername(editing.username);
        setEmail(editing.email);
        setPassword('');
        setFirstName(editing.firstName);
        setLastName(editing.lastName);
        setRole(editing.role);
        setActive(editing.active);
      } else {
        setUsername(''); setEmail(''); setPassword('');
        setFirstName(''); setLastName('');
        setRole('ADMIN'); setActive(true);
      }
      setErr('');
    }
  }, [open, editing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      if (editing) {
        const payload: Parameters<typeof updateUser>[1] = { email, firstName, lastName, role, active };
        if (password) payload.password = password;
        await updateUser(editing.id, payload);
      } else {
        const payload: CreateUserPayload = { username, email, password, firstName, lastName, role };
        await createUser(payload);
      }
      await onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer open">
        <div className="drawer-head">
          <h3>{editing ? `Modifier @${editing.username}` : 'Nouveau compte'}</h3>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <form className="drawer-body" onSubmit={handleSave} style={{ display: 'grid', gap: '1rem' }}>
          {err && <div className="lf-err show"><span>{err}</span></div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
            <label style={{ fontSize: '.8rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Prénom *</div>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required style={{ width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)' }} />
            </label>
            <label style={{ fontSize: '.8rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Nom *</div>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required style={{ width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)' }} />
            </label>
          </div>

          <label style={{ fontSize: '.8rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Username * {editing && <span style={{ fontSize: '.7rem', color: 'var(--gris-500)', fontWeight: 400 }}>(immuable)</span>}</div>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} disabled={!!editing} style={{ width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)', background: editing ? 'var(--gris-50)' : 'white', color: editing ? 'var(--gris-500)' : 'var(--noir)' }} />
          </label>

          <label style={{ fontSize: '.8rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Email *</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)' }} />
          </label>

          <label style={{ fontSize: '.8rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>
              {editing ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe * (min 6)'}
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!editing} minLength={editing ? 0 : 6} style={{ width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)' }} />
          </label>

          <div>
            <div style={{ fontWeight: 600, marginBottom: '.4rem', fontSize: '.8rem' }}>Rôle *</div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button type="button" onClick={() => setRole('ADMIN')} className={`filter-chip ${role === 'ADMIN' ? 'active' : ''}`}>Admin</button>
              <button type="button" onClick={() => setRole('SUPER_ADMIN')} className={`filter-chip ${role === 'SUPER_ADMIN' ? 'active' : ''}`}>★ Super Admin</button>
            </div>
          </div>

          {editing && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.85rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
              <span>Compte actif (autoriser la connexion)</span>
            </label>
          )}

          <button type="submit" className="btn btn-gold" disabled={saving} style={{ marginTop: '.5rem' }}>
            {saving ? 'Sauvegarde…' : (editing ? 'Enregistrer' : 'Créer le compte')}
          </button>
        </form>
      </aside>
    </>
  );
}
