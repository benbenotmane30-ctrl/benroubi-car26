import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

/** Page de login — design split-screen premium identique au legacy. */
export function LoginPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const { setAuthed } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pass) { setErr('Identifiant et mot de passe requis.'); return; }
    setLoading(true); setErr('');
    try {
      const r = await login(user, pass, remember);
      if (!r.success) {
        setErr(r.message ?? 'Identifiants incorrects.');
        setPass('');
        return;
      }
      setAuthed(true);
      navigate('/dashboard');
    } catch {
      setErr('Impossible de joindre le serveur. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-screen">
      {/* Brand panel (gauche) */}
      <div className="login-brand">
        <div>
          <div className="lb-logo">Benroubi<span> Car</span></div>
          <div className="lb-tagline">Espace administration</div>
        </div>
        <div>
          <h1 className="lb-hero">Pilotez votre<br /><em>flotte</em><br />en toute sérénité.</h1>
          <p className="lb-sub">Gérez vos véhicules, photos, tarifs et disponibilités depuis une interface pensée pour aller à l'essentiel.</p>
          <div className="lb-foot">
            <div><strong>15+</strong>véhicules</div>
            <div><strong>4,7★</strong>clients</div>
            <div><strong>6j/7</strong>service</div>
          </div>
        </div>
      </div>

      {/* Form panel (droite) */}
      <div className="login-form-side">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h2 className="lf-title">Connexion</h2>
          <p className="lf-sub">Bienvenue. Entrez vos identifiants pour accéder au panneau.</p>

          {err && (
            <div className="lf-err show">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{err}</span>
            </div>
          )}

          <div className="lf-field">
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder=" "
              autoComplete="username"
              required
            />
            <label>Identifiant</label>
            <span className="lf-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </span>
          </div>

          <div className="lf-field">
            <input
              type={showPass ? 'text' : 'password'}
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder=" "
              autoComplete="current-password"
              required
            />
            <label>Mot de passe</label>
            <span className="lf-icon" onClick={() => setShowPass(s => !s)} title="Afficher/masquer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
            </span>
          </div>

          <div className="lf-options">
            <label className="lf-remember">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              <span>Se souvenir de moi</span>
            </label>
            <a className="lf-forgot" onClick={() => alert('Contactez l\'administrateur technique pour réinitialiser votre mot de passe.')}>
              Mot de passe oublié ?
            </a>
          </div>

          <button type="submit" className={`btn-login ${loading ? 'loading' : ''}`} disabled={loading}>
            <span>
              Se connecter{' '}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </button>

          <p className="lf-help">Accès réservé · Benroubi Car © {new Date().getFullYear()}</p>
        </form>
      </div>
    </div>
  );
}
