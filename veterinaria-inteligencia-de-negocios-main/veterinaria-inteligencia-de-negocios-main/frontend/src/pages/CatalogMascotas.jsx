import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import PublicLayout from '../components/PublicLayout';
import { Search, ChevronLeft, ChevronRight, User } from 'lucide-react';

export default function CatalogMascotas() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('especie');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const { data: mascotas = [], isLoading, isError } = useQuery({
    queryKey: ['mascotas'],
    queryFn: () => api.get('/api/catalogo/mascotas').then((r) => r.data),
  });

  const filteredAndSorted = useMemo(() => {
    let result = mascotas.filter((m) =>
      m.especie?.toLowerCase().includes(search.toLowerCase()) || 
      m.raza?.toLowerCase().includes(search.toLowerCase()) ||
      m.nombre?.toLowerCase().includes(search.toLowerCase())
    );
    result.sort((a, b) => {
      if (sortBy === 'peso') return (a.peso || 0) - (b.peso || 0);
      return (a.especie || '').localeCompare(b.especie || '');
    });
    return result;
  }, [mascotas, search, sortBy]);

  const paginated = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, page]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage) || 1;

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8 text-center">Catálogo de Mascotas</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              className="w-full border pl-10 p-3 rounded"
              placeholder="Buscar por especie, raza o dueño..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select 
            className="border p-3 rounded bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="especie">Ordenar por Especie</option>
            <option value="peso">Ordenar por Peso</option>
          </select>
        </div>

        {isLoading ? (
          <p className="text-gray-500 text-center py-10">Cargando mascotas...</p>
        ) : isError ? (
          <p className="text-red-500 text-center py-10">Error al cargar mascotas</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((m) => (
                <div key={m.idMascota} className="bg-white rounded-lg shadow p-6 border hover:shadow-lg transition">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-green-500" />
                    <h2 className="font-bold text-lg">Dueño: {m.nombre || 'Desconocido'}</h2>
                  </div>
                  <div className="flex flex-col gap-1 mb-3 text-sm text-gray-700">
                    <p><span className="font-semibold">Especie:</span> {m.especie || 'N/A'}</p>
                    <p><span className="font-semibold">Raza:</span> {m.raza || 'N/A'}</p>
                    <p><span className="font-semibold">Género:</span> {m.genero || 'N/A'}</p>
                    <p><span className="font-semibold">Color:</span> {m.color || 'N/A'}</p>
                    <p><span className="font-semibold">Fecha Nac.:</span> {m.fechNac || 'N/A'}</p>
                  </div>
                  <p className="text-xl font-bold text-blue-700">Peso: {m.peso ? `${m.peso} kg` : 'N/A'}</p>
                </div>
              ))}
              {paginated.length === 0 && (
                <p className="col-span-full text-center text-gray-400 py-8">No se encontraron mascotas</p>
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
