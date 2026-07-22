import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Layout from '../components/Layout';
import { Users, Search, Database } from 'lucide-react';

// Los 2 sistemas operacionales, cada uno conectado a su propia BD.
const SISTEMAS = [
  { id: 'veterinaria', label: 'Veterinaria Castillón', bd: 'BD_CASTILLON_VETERINARIA', color: 'bg-blue-100 text-blue-700' },
  { id: 'castillonv2', label: 'Castillón V2', bd: 'CASTILLONV2', color: 'bg-emerald-100 text-emerald-700' },
];

export default function Clientes() {
  const [sistema, setSistema] = useState('veterinaria');
  const [search, setSearch] = useState('');
  const activo = SISTEMAS.find((s) => s.id === sistema);

  const { data: clientes = [], isLoading, isError } = useQuery({
    queryKey: ['fuente-clientes', sistema],
    queryFn: () => api.get(`/api/fuentes/${sistema}/clientes`).then((r) => r.data),
  });

  const filtrados = useMemo(() => {
    const q = search.toLowerCase();
    return clientes.filter((c) =>
      `${c.nombre || ''} ${c.apellido || ''} ${c.empresa || ''}`.toLowerCase().includes(q)
    );
  }, [clientes, search]);

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Gestión de Clientes</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <Database className="h-4 w-4" /> Sistema conectado a <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${activo?.color}`}>{activo?.bd}</span>
          </p>
        </div>
      </div>

      {/* Selector de sistema */}
      <div className="mb-4 flex flex-wrap gap-2">
        {SISTEMAS.map((s) => (
          <button key={s.id} onClick={() => setSistema(s.id)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${sistema === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10" placeholder="Buscar por nombre o empresa…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" /></div>
      ) : isError ? (
        <p className="py-10 text-center text-rose-500">Error al cargar clientes</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                <th className="p-3 font-semibold">ID</th>
                <th className="p-3 font-semibold">Nombre</th>
                <th className="p-3 font-semibold">Apellido</th>
                <th className="p-3 font-semibold">Empresa</th>
                <th className="p-3 font-semibold">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((c, i) => (
                <tr key={`${c.idOrigen}-${i}`} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono text-xs text-slate-400">{c.idOrigen}</td>
                  <td className="p-3 font-medium text-slate-800">{c.nombre || '—'}</td>
                  <td className="p-3 text-slate-600">{c.apellido || '—'}</td>
                  <td className="p-3 text-slate-600">{c.empresa || '—'}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{c.tipoCliente || '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && <div className="py-10 text-center text-slate-400">No hay clientes.</div>}
          <div className="border-t border-slate-100 p-3 text-right text-xs text-slate-400">{filtrados.length} clientes</div>
        </div>
      )}
    </Layout>
  );
}
