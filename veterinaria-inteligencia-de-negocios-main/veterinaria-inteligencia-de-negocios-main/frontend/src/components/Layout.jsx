import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, User } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">Consolidado</span>
          {isAdmin ? (
            <button onClick={() => navigate('/dashboard')} className="text-sm text-blue-600 hover:underline">
              <Package className="inline w-4 h-4 mr-1" />Productos
            </button>
          ) : (
            <button onClick={() => navigate('/catalog')} className="text-sm text-blue-600 hover:underline">
              <Package className="inline w-4 h-4 mr-1" />Catálogo
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500"><User className="inline w-4 h-4 mr-1" />{user?.username} ({user?.rol})</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
            <LogOut className="inline w-4 h-4" /> Salir
          </button>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
