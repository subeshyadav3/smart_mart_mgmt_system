import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onMenuClick, title, subtitle }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8">
      <div className="flex items-center gap-4">
        <Button variant="secondary" className="md:hidden" onClick={onMenuClick}>
          Menu
        </Button>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5 hidden md:block">
            Smart Mart Management System
          </p>
          <h1 className="text-lg md:text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 hidden md:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full text-xs font-semibold text-purple-700 border border-purple-100">
          <span>{user?.role || 'STAFF'}</span>
          <span className="opacity-40 font-normal border-l border-purple-300 pl-2">{user?.type || 'SESSION'}</span>
        </div>
        <Button variant="ghost" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}