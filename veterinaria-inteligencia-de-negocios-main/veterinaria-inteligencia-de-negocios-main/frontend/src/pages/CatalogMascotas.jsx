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
      m.dueno?.toLowerCase().includes(search.toLowerCase())
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
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <User className="h-3.5 w-3.5" /> Mascotas
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold md:text-5xl">Catálogo de Mascotas</h1>
          <p className="mt-3 text-emerald-50">Mascotas registradas y sus dueños</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto mb-10 flex max-w-2xl flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-11 py-3"
              placeholder="Buscar por especie, raza o dueño..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input bg-white py-3 md:w-56"
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
                <div key={m.idMascota} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Dueño</p>
                      <h2 className="truncate font-display text-lg font-bold text-slate-800">{m.dueno || 'Desconocido'}</h2>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{m.especie || 'N/A'}</span>
                      {m.raza && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{m.raza}</span>}
                      {m.genero && <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">{m.genero === 'M' ? 'Macho' : m.genero === 'H' ? 'Hembra' : m.genero}</span>}
                    </div>
                    <dl className="grid grid-cols-2 gap-y-2 text-sm">
                      <dt className="text-slate-400">Color</dt>
                      <dd className="text-right font-medium text-slate-700">{m.color || 'N/A'}</dd>
                      <dt className="text-slate-400">Nacimiento</dt>
                      <dd className="text-right font-medium text-slate-700">{m.fechNac || 'N/A'}</dd>
                      <dt className="text-slate-400">Peso</dt>
                      <dd className="text-right font-bold text-emerald-600">{m.peso ? `${m.peso} kg` : 'N/A'}</dd>
                    </dl>
                  </div>
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
