import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { isAuthenticated, logout as doLogout, getStoredExp, getStoredUser } from '../services/auth.service';
import type { AuthUser } from '../types';

interface AuthCtx {
  authed: boolean;
  user: AuthUser | null;
  isSuperAdmin: boolean;
  setAuthed: (v: boolean) => void;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(isAuthenticated());
  const [user,   setUser]   = useState<AuthUser | null>(getStoredUser());

  // Auto-logout à l'expiration du token
  useEffect(() => {
    if (!authed) return;
    const exp = getStoredExp();
    const ms = exp - Date.now();
    if (ms <= 0) { doLogout(); setAuthed(false); setUser(null); return; }
    const t = setTimeout(() => {
      doLogout();
      setAuthed(false);
      setUser(null);
      alert('Votre session a expiré. Reconnectez-vous.');
    }, ms);
    return () => clearTimeout(t);
  }, [authed]);

  // Reload user from storage quand authed change (post-login)
  useEffect(() => {
    if (authed) setUser(getStoredUser());
  }, [authed]);

  const logout = () => { doLogout(); setAuthed(false); setUser(null); };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider value={{ authed, user, isSuperAdmin, setAuthed, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
