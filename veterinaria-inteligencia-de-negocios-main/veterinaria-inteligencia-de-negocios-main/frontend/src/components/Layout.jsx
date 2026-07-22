import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Package, BarChart3, Users, Database } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const rol = user?.rol;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  let navItems;
  if (rol === 'ADMIN') {
    navItems = [
      { to: '/dashboard', label: 'Productos', icon: Package },
      { to: '/clientes', label: 'Clientes', icon: Users },
      { to: '/consolidado', label: 'Consolidado', icon: BarChart3 },
    ];
  } else if (rol === 'CASTILLONV2') {
    navItems = [{ to: '/castillonv2', label: 'Sistema Castillón V2', icon: Database }];
  } else {
    navItems = [
      { to: '/consolidado', label: 'Consolidado', icon: BarChart3 },
      { to: '/catalog', label: 'Catálogo', icon: Package },
    ];
  }
  const home = rol === 'ADMIN' ? '/dashboard' : rol === 'CASTILLONV2' ? '/castillonv2' : '/consolidado';

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(home)}
              className="font-display text-lg font-bold text-slate-900">
              Consolidado<span className="text-blue-600">.</span>
            </button>
            <div className="hidden items-center gap-1 sm:flex">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <button key={item.to} onClick={() => navigate(item.to)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
                    <item.icon className="h-4 w-4" /> {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-2 pr-3 text-sm text-slate-600">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
                {user?.username?.[0]?.toUpperCase()}
              </span>
              <span className="hidden font-medium sm:inline">{user?.username}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>{user?.rol}</span>
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
