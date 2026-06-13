import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCars } from '../contexts/CarsContext';

type PageDef = {
  path: string;
  label: string;
  group: string;
  icon: ReactNode;
  count?: boolean;
  superAdminOnly?: boolean;
};

const PAGES: PageDef[] = [
  { path: '/dashboard', label: 'Tableau de bord', group: 'Pilotage',  icon: <DashboardIcon /> },
  { path: '/fleet',     label: 'Véhicules',       group: 'Catalogue', icon: <CarIcon />,       count: true },
  { path: '/preview',   label: 'Aperçu catalogue', group: 'Catalogue', icon: <EyeIcon /> },
  { path: '/insurances', label: "Fins d'assurance",       group: 'Échéances', icon: <ShieldIcon /> },
  { path: '/visites',    label: 'Fins de visite technique', group: 'Échéances', icon: <WrenchIcon /> },
  { path: '/backup',    label: 'Sauvegarde',      group: 'Outils',    icon: <BackupIcon /> },
  { path: '/profile',   label: 'Mon profil',      group: 'Compte',    icon: <UserIcon /> },
  { path: '/users',     label: 'Gestion comptes', group: 'Compte',    icon: <UsersIcon />,    superAdminOnly: true },
  { path: '/audit',     label: "Journal d'audit", group: 'Compte',    icon: <AuditIcon />,    superAdminOnly: true },
];

interface AppShellProps {
  children: ReactNode;
}

/** Layout principal de l'admin : sidebar + topbar + slot pour la page courante. */
export function AppShell({ children }: AppShellProps) {
  const { logout, user, isSuperAdmin } = useAuth();
  const { cars } = useCars();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const carsCount = cars.length;
  const currentTitle = PAGES.find(p => p.path === location.pathname)?.label ?? 'Administration';

  const handleLogout = () => {
    if (!confirm('Se déconnecter ?')) return;
    logout();
    navigate('/');
  };

  // Filtre les pages selon le rôle, puis groupe pour la sidebar
  const visiblePages = PAGES.filter(p => !p.superAdminOnly || isSuperAdmin);
  const groups: Record<string, PageDef[]> = {};
  visiblePages.forEach(p => {
    if (!groups[p.group]) groups[p.group] = [];
    groups[p.group].push(p);
  });

  const initials   = user ? ((user.firstName[0] ?? '') + (user.lastName[0] ?? '')).toUpperCase() : 'A';
  const fullName   = user ? `${user.firstName} ${user.lastName}` : 'Administrateur';
  const roleLabel  = isSuperAdmin ? '★ Super Admin' : 'Admin';

  return (
    <div id="app" className="visible">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-head">
          <div className="sidebar-logo">Benroubi<span> Car</span></div>
          <span className="sidebar-badge">Administration</span>
        </div>

        <nav className="sidebar-nav">
          {Object.entries(groups).map(([groupName, pages]) => (
            <div key={groupName}>
              <div className="nav-group-label" style={{ marginTop: groupName === 'Pilotage' ? 0 : '1.2rem' }}>
                {groupName}
              </div>
              {pages.map(p => (
                <Link
                  key={p.path}
                  to={p.path}
                  className={`nav-item ${location.pathname === p.path ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {p.icon}
                  <span>{p.label}</span>
                  {'count' in p && p.count && <span className="nav-item-count">{carsCount}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{fullName}</div>
              <div className="user-role">{roleLabel}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <button className="hamburger-admin" onClick={() => setSidebarOpen(true)}>
              <span></span><span></span><span></span>
            </button>
            <div>
              <div className="topbar-title">{currentTitle}</div>
              <div className="topbar-crumb"><span>Admin</span><span>{currentTitle}</span></div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

// ─── Icônes SVG ─────────────────────────────────────────
function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
    </svg>
  );
}
function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 16H9m10 0h2a2 2 0 0 0 2-2v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1.5 1.5 0 0 0 16.732 5H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1" />
      <circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function BackupIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
      <polyline points="12 11 12 17" /><polyline points="9 14 12 17 15 14" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
function AuditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
