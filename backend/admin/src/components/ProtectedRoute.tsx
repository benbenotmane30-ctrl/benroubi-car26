import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

/** Wrapper qui redirige vers / si pas authentifié. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  if (!authed) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Wrapper qui exige le rôle SUPER_ADMIN, sinon redirige vers /dashboard. */
export function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { authed, isSuperAdmin } = useAuth();
  if (!authed) return <Navigate to="/" replace />;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
