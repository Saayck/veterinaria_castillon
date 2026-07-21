import { Package, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export default function ProductCard({ p }) {
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Show "Comprar" button for anonymous users or 'USER' role
  const showCartButton = !user || user.rol === 'USER';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group cursor-pointer flex flex-col h-full">
      <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0">
        <Package className="w-16 h-16 text-blue-400" />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-2">{p.nomProducto}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{p.descripcion || 'Sin descripción'}</p>
        
        {/* Opcional: mostrar stock si es relevante */}
        <p className="text-xs text-gray-400 mb-2">Stock: {p.stockActual ?? 0}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-bold text-blue-600">S/{p.precioUnitario?.toFixed(2)}</span>
          
          {showCartButton && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (p.stockActual > 0) {
                  addToCart(p);
                  toast.success(`${p.nomProducto} agregado al carrito`);
                }
              }}
              disabled={p.stockActual <= 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <ShoppingCart className="w-4 h-4" /> {p.stockActual <= 0 ? 'Agotado' : 'Comprar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
