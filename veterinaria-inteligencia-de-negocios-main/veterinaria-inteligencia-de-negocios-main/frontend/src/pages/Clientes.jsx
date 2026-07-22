import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { Search, Database, Plus, Pencil, Trash2 } from 'lucide-react';

const SISTEMAS = [
  { id: 'veterinaria', label: 'Veterinaria Castillón', bd: 'BD_CASTILLON_VETERINARIA', color: 'bg-blue-100 text-blue-700' },
  { id: 'castillonv2', label: 'Castillón V2', bd: 'CASTILLONV2', color: 'bg-emerald-100 text-emerald-700' },
];

function ClienteModal({ cliente, onSave, onClose }) {
  const [form, setForm] = useState({
    nombre: cliente?.nombre || '',
    apePaterno: cliente?.apePaterno || '',
    apeMaterno: cliente?.apeMaterno || '',
  });
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => { e.preventDefault(); onSave(form); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 font-display text-xl font-bold text-slate-800">{cliente ? 'Editar' : 'Nuevo'} Cliente</h2>
        <div className="space-y-3">
          <input name="nombre" placeholder="Nombre(s)" className="input" value={form.nombre} onChange={change} required />
          <input name="apePaterno" placeholder="Apellido paterno" className="input" value={form.apePaterno} onChange={change} />
          <input name="apeMaterno" placeholder="Apellido materno" className="input" value={form.apeMaterno} onChange={change} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
          <button type="submit" className="btn-primary">Guardar</button>
        </div>
      </form>
    </div>
  );
}

export default function Clientes() {
  const queryClient = useQueryClient();
  const [sistema, setSistema] = useState('veterinaria');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const activo = SISTEMAS.find((s) => s.id === sistema);

  const { data: clientes = [], isLoading, isError } = useQuery({
    queryKey: ['sis-clientes', sistema],
    queryFn: () => api.get(`/api/sistemas/${sistema}/clientes`).then((r) => r.data),
  });

  const save = useMutation({
    mutationFn: ({ id, data }) => id
      ? api.put(`/api/sistemas/${sistema}/clientes/${id}`, data)
      : api.post(`/api/sistemas/${sistema}/clientes`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sis-clientes'] }); setModal(null); toast.success('Cliente guardado'); },
    onError: () => toast.error('Error al guardar'),
  });
  const del = useMutation({
    mutationFn: (id) => api.delete(`/api/sistemas/${sistema}/clientes/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sis-clientes'] }); toast.success('Cliente eliminado'); },
    onError: () => toast.error('Error al eliminar'),
  });

  const filtrados = useMemo(() => {
    const q = search.toLowerCase();
    return clientes.filter((c) => `${c.nombre || ''} ${c.apePaterno || ''} ${c.apeMaterno || ''}`.toLowerCase().includes(q));
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
        <button onClick={() => setModal({})} className="btn-primary"><Plus className="h-5 w-5" /> Nuevo Cliente</button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {SISTEMAS.map((s) => (
          <button key={s.id} onClick={() => setSistema(s.id)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${sistema === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10" placeholder="Buscar por nombre…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {modal && (
        <ClienteModal
          cliente={modal.id ? modal : null}
          onSave={(data) => save.mutate({ id: modal?.id, data })}
          onClose={() => setModal(null)}
        />
      )}

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
                <th className="p-3 font-semibold">Ap. Paterno</th>
                <th className="p-3 font-semibold">Ap. Materno</th>
                <th className="p-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono text-xs text-slate-400">{c.id}</td>
                  <td className="p-3 font-medium text-slate-800">{c.nombre || '—'}</td>
                  <td className="p-3 text-slate-600">{c.apePaterno || '—'}</td>
                  <td className="p-3 text-slate-600">{c.apeMaterno || '—'}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => setModal({ ...c })} className="mr-1 rounded-lg p-2 text-blue-600 hover:bg-blue-100"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm('¿Eliminar cliente?')) del.mutate(c.id); }} className="rounded-lg p-2 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
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
