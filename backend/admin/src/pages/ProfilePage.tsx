import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchMe, updateMyProfile, changeMyPassword } from '../services/users.service';
import type { User } from '../types';

export function ProfilePage() {
  const { user: authUser, setUser } = useAuth();
  const [user,      setLocalUser]   = useState<User | null>(null);
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState('');

  // Form profil
  const [email,     setEmail]     = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [savingP,   setSavingP]   = useState(false);

  // Form password
  const [oldP,      setOldP]      = useState('');
  const [newP,      setNewP]      = useState('');
  const [confirmP,  setConfirmP]  = useState('');
  const [savingPw,  setSavingPw]  = useState(false);

  useEffect(() => {
    fetchMe()
      .then(u => {
        setLocalUser(u);
        setEmail(u.email);
        setFirstName(u.firstName);
        setLastName(u.lastName);
      })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingP(true); setError('');
    try {
      const updated = await updateMyProfile({ email, firstName, lastName });
      setLocalUser(updated);
      // Sync l'AuthContext (sidebar etc.)
      if (authUser) {
        const newUser = { ...authUser, email: updated.email, firstName: updated.firstName, lastName: updated.lastName };
        setUser(newUser);
        // Update aussi le localStorage/sessionStorage
        const storage = localStorage.getItem('bc_admin_user') ? localStorage : sessionStorage;
        storage.setItem('bc_admin_user', JSON.stringify(newUser));
      }
      alert('Profil mis à jour.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingP(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newP !== confirmP) { setError('Les deux nouveaux mots de passe ne correspondent pas.'); return; }
    if (newP.length < 6) { setError('Nouveau mot de passe trop court (min 6).'); return; }
    setSavingPw(true); setError('');
    try {
      await changeMyPassword(oldP, newP);
      setOldP(''); setNewP(''); setConfirmP('');
      alert('Mot de passe changé.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) return <div className="page active"><p style={{ textAlign: 'center', padding: '3rem' }}>Chargement…</p></div>;
  if (!user) return <div className="page active"><p>Profil introuvable.</p></div>;

  const initials = (user.firstName[0] ?? '') + (user.lastName[0] ?? '');

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h2>Mon profil</h2>
          <p className="subtitle">Gérez vos informations et votre mot de passe.</p>
        </div>
      </div>

      {error && (
        <div className="lf-err show" style={{ marginBottom: '1rem' }}>
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.2rem' }}>
        {/* Carte identité */}
        <div className="card">
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--gold)',
              color: 'var(--noir)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {initials}
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: 0 }}>
                {user.firstName} {user.lastName}
              </h3>
              <p style={{ color: 'var(--gris-500)', fontSize: '.85rem', margin: '.2rem 0' }}>@{user.username}</p>
              <div style={{ display: 'inline-block', padding: '.2rem .7rem', borderRadius: 12,
                  background: user.role === 'SUPER_ADMIN' ? 'rgba(201,169,110,.18)' : 'rgba(100,116,139,.15)',
                  color:      user.role === 'SUPER_ADMIN' ? 'var(--gold-dark)'      : 'var(--gris-700)',
                  fontSize: '.72rem', fontWeight: 600, letterSpacing: '.05em', marginTop: '.3rem' }}>
                {user.role === 'SUPER_ADMIN' ? '★ SUPER ADMIN' : 'ADMIN'}
              </div>
            </div>
          </div>
          <div className="card-body" style={{ borderTop: '1px solid var(--gris-200)', fontSize: '.85rem', color: 'var(--gris-700)', display: 'grid', gap: '.4rem' }}>
            <div><strong>Compte créé :</strong> {new Date(user.createdAt).toLocaleString('fr-FR')}</div>
            <div><strong>Dernière connexion :</strong> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR') : 'Jamais'}</div>
            <div><strong>Statut :</strong> <span style={{ color: user.active ? 'var(--vert-dark)' : 'var(--rouge-dark)' }}>{user.active ? '● Actif' : '● Désactivé'}</span></div>
          </div>
        </div>

        {/* Form profil */}
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: '0 0 1rem' }}>Informations</h3>
            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '.8rem' }}>
              <label style={{ display: 'block', fontSize: '.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Username (immuable)</div>
                <input type="text" value={user.username} disabled style={{ width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)', background: 'var(--gris-50)', color: 'var(--gris-500)' }} />
              </label>
              <label style={{ display: 'block', fontSize: '.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Prénom</div>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required style={{ width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)' }} />
              </label>
              <label style={{ display: 'block', fontSize: '.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Nom</div>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required style={{ width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)' }} />
              </label>
              <label style={{ display: 'block', fontSize: '.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Email</div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)' }} />
              </label>
              <button type="submit" className="btn btn-gold" disabled={savingP} style={{ marginTop: '.4rem' }}>
                {savingP ? 'Sauvegarde…' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>

        {/* Form password */}
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: '0 0 1rem' }}>Changer le mot de passe</h3>
            <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '.8rem' }}>
              <label style={{ display: 'block', fontSize: '.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Mot de passe actuel</div>
                <input type="password" value={oldP} onChange={e => setOldP(e.target.value)} required autoComplete="current-password" style={{ width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)' }} />
              </label>
              <label style={{ display: 'block', fontSize: '.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Nouveau mot de passe (min 6)</div>
                <input type="password" value={newP} onChange={e => setNewP(e.target.value)} required minLength={6} autoComplete="new-password" style={{ width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)' }} />
              </label>
              <label style={{ display: 'block', fontSize: '.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Confirmer</div>
                <input type="password" value={confirmP} onChange={e => setConfirmP(e.target.value)} required minLength={6} autoComplete="new-password" style={{ width: '100%', padding: '.55rem .8rem', border: '1px solid var(--gris-200)', borderRadius: 'var(--radius-sm)' }} />
              </label>
              <button type="submit" className="btn btn-vert" disabled={savingPw} style={{ marginTop: '.4rem' }}>
                {savingPw ? 'Changement…' : 'Changer le mot de passe'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
