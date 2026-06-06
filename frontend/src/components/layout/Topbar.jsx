import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onMenuClick, title, subtitle }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Button variant="secondary" className="mobile-only" onClick={onMenuClick}>
          Menu
        </Button>
        <div>
          <p className="eyebrow">Smart Mart Management System</p>
          <h1>{title}</h1>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
      </div>

      <div className="topbar-right">
        <div className="session-pill">
          <span className="session-role">{user?.role || 'STAFF'}</span>
          <span className="session-type">{user?.type || 'SESSION'}</span>
        </div>
        <Button variant="ghost" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
