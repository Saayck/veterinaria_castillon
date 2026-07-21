import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import PublicLayout from '../components/PublicLayout';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { Package, Search, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('nombre');
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const itemsPerPage = 6;

  const { data: productos = [], isLoading, isError } = useQuery({
    queryKey: ['catalogo'],
    queryFn: () => api.get('/api/catalogo/productos').then((r) => r.data),
  });

  const filteredAndSorted = useMemo(() => {
    let result = productos.filter((p) =>
      p.nomProducto?.toLowerCase().includes(search.toLowerCase())
    );
    result.sort((a, b) => {
      if (sortBy === 'precio') return a.precioUnitario - b.precioUnitario;
      return a.nomProducto?.localeCompare(b.nomProducto);
    });
    return result;
  }, [productos, search, sortBy]);

  const paginated = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, page]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8 text-center">Catálogo de Productos</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              className="w-full border pl-10 p-3 rounded"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select 
            className="border p-3 rounded bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="nombre">Ordenar por Nombre</option>
            <option value="precio">Ordenar por Precio</option>
          </select>
        </div>

        {isLoading ? (
          <p className="text-gray-500 text-center py-10">Cargando catálogo...</p>
        ) : isError ? (
          <p className="text-red-500 text-center py-10">Error al cargar productos</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((p) => (
                <ProductCard key={p.idProducto} p={p} />
              ))}
              {paginated.length === 0 && (
                <p className="col-span-full text-center text-gray-400 py-8">No se encontraron productos</p>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 border rounded disabled:opacity-50"><ChevronLeft /></button>
                <span>Página {page} de {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 border rounded disabled:opacity-50"><ChevronRight /></button>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
