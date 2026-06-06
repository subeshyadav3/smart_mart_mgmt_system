import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNavItems = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/products', label: 'Products' },
  { to: '/app/sales', label: 'Sales' },
  { to: '/app/members', label: 'Members' },
  { to: '/app/workforce', label: 'Workforce' },
];

const staffNavItems = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/products', label: 'Products' },
  { to: '/app/sales', label: 'Sales' },
  { to: '/app/members', label: 'Members' },
];

const memberNavItems = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/sales', label: 'Sales' },
  { to: '/app/profile', label: 'Profile' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = user?.type === 'MEMBER' ? memberNavItems : user?.role === 'ADMIN' ? adminNavItems : staffNavItems;

  return (
    <aside className={`
      w-[260px] bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-40
      fixed md:sticky inset-y-0 left-0 transform transition-transform duration-200 ease-in-out md:transform-none
      ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="flex items-center justify-between md:justify-start gap-3 p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-600 font-bold w-9 h-9 flex items-center justify-center rounded-lg text-base">
            SM
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 tracking-tight">Smart Mart</h1>
            <p className="text-[11px] text-slate-400">Management Hub</p>
          </div>
        </div>
        <button className="text-2xl text-slate-400 md:hidden p-1 hover:text-slate-600" onClick={onClose} aria-label="Close menu">
          &times;
        </button>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
          {(user?.fullName || 'U').slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <strong className="block text-sm font-medium text-slate-800 truncate">{user?.fullName || 'User'}</strong>
          <p className="text-xs text-slate-400 truncate">
            {user?.email || user?.phoneNumber || user?.membershipId || 'Active session'}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              block px-4 py-2 text-sm rounded-md transition-colors
              ${isActive 
                ? 'bg-blue-50 text-blue-600 font-medium' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
            `}
            onClick={onClose}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 m-4 bg-slate-50 rounded-lg border border-slate-100">
        <p className="text-xs font-medium text-slate-700 mb-0.5">Need help?</p>
        <span className="text-[11px] text-slate-400 block leading-normal">
          Use the dashboard tools to manage daily operations faster.
        </span>
      </div>
    </aside>
  );
}