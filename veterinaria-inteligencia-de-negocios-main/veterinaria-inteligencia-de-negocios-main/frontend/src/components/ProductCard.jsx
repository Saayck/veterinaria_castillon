import { Package, ShoppingCart, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export default function ProductCard({ p }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Solo los usuarios autenticados con rol USER pueden comprar.
  const puedeComprar = user?.rol === 'USER';
  const agotado = !p.stockActual || p.stockActual <= 0;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Inicia sesión para comprar');
      navigate('/login');
      return;
    }
    if (!puedeComprar) return;
    if (agotado) return;
    addToCart(p);
    toast.success(`${p.nomProducto} agregado al carrito`);
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-44 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50">
        <Package className="h-16 w-16 text-blue-300 transition-transform duration-300 group-hover:scale-110" />
        {agotado && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
            Agotado
          </span>
        )}
      </div>

      <div className="flex flex-grow flex-col p-5">
        <h3 className="mb-1 font-display text-lg font-bold text-slate-800">{p.nomProducto}</h3>
        <p className="mb-4 line-clamp-2 flex-grow text-sm text-slate-500">{p.descripcion || 'Sin descripción'}</p>

        <div className="mb-3 flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${agotado ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {agotado ? 'Sin stock' : `Stock: ${p.stockActual}`}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-display text-2xl font-extrabold text-blue-600">
            S/{Number(p.precioUnitario ?? 0).toFixed(2)}
          </span>

          {!user ? (
            <button
              onClick={handleClick}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
            >
              <Lock className="h-4 w-4" /> Iniciar sesión
            </button>
          ) : puedeComprar ? (
            <button
              onClick={handleClick}
              disabled={agotado}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              <ShoppingCart className="h-4 w-4" /> {agotado ? 'Agotado' : 'Comprar'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
