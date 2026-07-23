import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Database } from 'lucide-react';

// Layout del portal exclusivo Castillón V2 (un solo sistema, un solo destino).
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
            <Database className="h-5 w-5 text-emerald-600" />
            Castillón V2<span className="text-emerald-600">.</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-2 pr-3 text-sm text-slate-600">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-xs font-bold text-white">
                {user?.username?.[0]?.toUpperCase()}
              </span>
              <span className="hidden font-medium sm:inline">{user?.username}</span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">{user?.rol}</span>
            </span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
