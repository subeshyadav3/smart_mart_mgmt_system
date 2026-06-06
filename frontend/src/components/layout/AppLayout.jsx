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
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onMenuClick={() => setMenuOpen((value) => !value)} title={current[0]} subtitle={current[1]} />
        <main className="flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto box-border">
          <Outlet context={{ role: user?.role, type: user?.type }} />
        </main>
      </div>

      {menuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 md:hidden" 
          onClick={() => setMenuOpen(false)} 
        />
      )}
    </div>
  );
}