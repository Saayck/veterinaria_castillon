import { useCart } from '../context/CartContext';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function CartDrawer() {
  const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    alert('¡Pedido procesado con éxito!');
    clearCart();
    toggleCart();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={toggleCart}
      />
      
      <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-xl z-50 flex flex-col transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            Mi Carrito
          </h2>
          <button 
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.idProducto} className="flex gap-4 border-b pb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 line-clamp-1">{item.nomProducto}</h3>
                  <p className="text-blue-600 font-bold mb-2">S/ {item.precioUnitario?.toFixed(2)}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded">
                      <button 
                        onClick={() => updateQuantity(item.idProducto, item.cantidad - 1)}
                        className="p-1 hover:bg-gray-100 disabled:opacity-50"
                        disabled={item.cantidad <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.cantidad}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.idProducto, item.cantidad + 1)}
                        className="p-1 hover:bg-gray-100 disabled:opacity-50"
                        disabled={item.cantidad >= item.stockActual}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.idProducto)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">S/ {(item.precioUnitario * item.cantidad).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">S/ {totalPrice.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Procesar Pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
}
