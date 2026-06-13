import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CarsProvider } from './contexts/CarsContext';
import { ProtectedRoute, SuperAdminRoute } from './components/ProtectedRoute';
import { AppShell } from './components/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FleetPage } from './pages/FleetPage';
import { PreviewPage } from './pages/PreviewPage';
import { BackupPage } from './pages/BackupPage';
import { ProfilePage } from './pages/ProfilePage';
import { UsersPage } from './pages/UsersPage';
import { AuditPage } from './pages/AuditPage';
import { InsurancePage } from './pages/InsurancePage';
import { VisitesPage } from './pages/VisitesPage';

/** Login → redirige déjà connecté vers /dashboard. */
function LoginGate() {
  const { authed } = useAuth();
  return authed ? <Navigate to="/dashboard" replace /> : <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarsProvider>
          <Routes>
            <Route path="/" element={<LoginGate />} />

            {/* Routes protégées avec AppShell */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppShell><DashboardPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/fleet" element={
              <ProtectedRoute>
                <AppShell><FleetPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/preview" element={
              <ProtectedRoute>
                <AppShell><PreviewPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/insurances" element={
              <ProtectedRoute>
                <AppShell><InsurancePage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/visites" element={
              <ProtectedRoute>
                <AppShell><VisitesPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/backup" element={
              <ProtectedRoute>
                <AppShell><BackupPage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppShell><ProfilePage /></AppShell>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <SuperAdminRoute>
                <AppShell><UsersPage /></AppShell>
              </SuperAdminRoute>
            } />
            <Route path="/audit" element={
              <SuperAdminRoute>
                <AppShell><AuditPage /></AppShell>
              </SuperAdminRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CarsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
