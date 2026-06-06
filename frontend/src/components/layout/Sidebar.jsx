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
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">SM</div>
        <div>
          <h1>Smart Mart</h1>
          <p>Management Hub</p>
        </div>
        <button className="icon-button mobile-only" onClick={onClose} aria-label="Close menu">
          ×
        </button>
      </div>

      <div className="sidebar-user">
        <div className="avatar">{(user?.fullName || 'U').slice(0, 1).toUpperCase()}</div>
        <div>
          <strong>{user?.fullName || 'User'}</strong>
          <p>{user?.email || user?.phoneNumber || user?.membershipId || 'Active session'}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
      </nav>

      <div className="sidebar-footer">
        <p>Need help?</p>
        <span>Use the dashboard tools to manage daily operations faster.</span>
      </div>
    </aside>
  );
}
