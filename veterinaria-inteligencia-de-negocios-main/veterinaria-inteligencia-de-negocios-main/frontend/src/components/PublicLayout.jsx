import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, PackageSearch, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function PublicLayout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, toggleCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollTo = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b">
        <div className="w-full mx-auto px-6 md:px-12 py-2 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-2xl text-gray-900 tracking-tight">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.png" alt="Logo Veterinaria" className="w-12 h-12 max-w-none object-contain" />
            </div>
            Consolidado<span className="text-blue-600">.</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('inicio')} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
              Inicio
            </button>
            <button onClick={() => scrollTo('sobre-nosotros')} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
              Sobre Nosotros
            </button>
            <Link to="/contacto" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
              Contáctanos
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user && isAdmin && (
              <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                <PackageSearch className="w-4 h-4" /> Panel Admin
              </Link>
            )}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
                  className="text-sm text-gray-700 hover:bg-gray-50 py-2 px-3 rounded-lg flex items-center gap-2 transition border border-transparent hover:border-gray-200"
                >
                  <User className="w-4 h-4 text-gray-500" /> 
                  <span className="font-medium capitalize">{user.username}</span>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }} 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                Iniciar Sesión
              </Link>
            )}
            
            {(!user || user.rol === 'USER') && (
              <button onClick={toggleCart} className="relative p-2 text-gray-600 hover:text-blue-600 transition ml-2">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="bg-gray-900 text-white py-6" id="contactanos">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-bold text-lg mb-2">Consolidado<span className="text-blue-400">.</span></h3>
            <p className="text-gray-400 text-sm">Gestión centralizada de productos con sincronización automática entre bases de datos.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Enlaces</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li><button onClick={() => scrollTo('inicio')} className="hover:text-white">Inicio</button></li>
              <li><button onClick={() => scrollTo('sobre-nosotros')} className="hover:text-white">Sobre Nosotros</button></li>
              <li><button onClick={() => scrollTo('productos')} className="hover:text-white">Productos Destacados</button></li>
              <li><Link to="/catalog" className="hover:text-white">Catálogo de Productos</Link></li>
              <li><Link to="/mascotas" className="hover:text-white">Catálogo de Mascotas</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Contacto</h4>
            <p className="text-gray-400 text-sm">info@consolidado.com<br />+1 (809) 555-0100<br />Santo Domingo, R.D.</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-6 pt-4 border-t border-gray-800 text-center text-sm text-gray-500">
          © 2025 Sistema Consolidado. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
