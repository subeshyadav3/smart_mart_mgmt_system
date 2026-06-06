import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../context/AuthContext';

const titles = {
  '/app/dashboard': ['Dashboard', 'Monitor your mart operations from one streamlined view.'],
  '/app/products': ['Products', 'Manage inventory, pricing, and stock levels with confidence.'],
  '/app/sales': ['Sales', 'Track bills, create sales, and monitor checkout activity.'],
  '/app/members': ['Members', 'Keep membership records active and organized.'],
  '/app/workforce': ['Workforce', 'Manage staff roles, status, and team access.'],
  '/app/profile': ['Profile', 'Edit your personal account information.'],
};

export default function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const current = useMemo(() => {
    const exact = titles[location.pathname];
    if (exact) return exact;
    if (location.pathname.startsWith('/app/products')) return titles['/app/products'];
    if (location.pathname.startsWith('/app/sales')) return titles['/app/sales'];
    if (location.pathname.startsWith('/app/members')) return titles['/app/members'];
    if (location.pathname.startsWith('/app/workforce')) return titles['/app/workforce'];
    if (location.pathname.startsWith('/app/profile')) return titles['/app/profile'];
    return titles['/app/dashboard'];
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className={`app-content ${menuOpen ? 'menu-open' : ''}`}>
        <Topbar onMenuClick={() => setMenuOpen((value) => !value)} title={current[0]} subtitle={current[1]} />
        <main className="main-area">
          <Outlet context={{ role: user?.role, type: user?.type }} />
        </main>
      </div>
      {menuOpen ? <div className="overlay" onClick={() => setMenuOpen(false)} /> : null}
    </div>
  );
}
