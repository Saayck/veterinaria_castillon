import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import PublicLayout from '../components/PublicLayout';
import { Package, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('nombre');
  const [page, setPage] = useState(1);
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
      {/* Encabezado */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Package className="h-3.5 w-3.5" /> Catálogo
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold md:text-5xl">Catálogo de Productos</h1>
          <p className="mt-3 text-blue-100">Explora nuestra variedad de productos consolidados</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto mb-10 flex max-w-2xl flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-11 py-3"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input bg-white py-3 md:w-56"
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
