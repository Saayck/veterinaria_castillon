import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { Package, Users, Plus, Pencil, Trash2, Search, Database } from 'lucide-react';

const BASE = '/api/sistemas/castillonv2';

// ---------------- Productos ----------------
function ProductoModal({ producto, categorias, onSave, onClose }) {
  const [f, setF] = useState({
    nombre: producto?.nombre || '', descripcion: producto?.descripcion || '',
    idCategoria: producto?.idCategoria || '', precio: producto?.precio ?? '', marca: producto?.marca || '',
  });
  const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const submit = (e) => { e.preventDefault(); onSave({ ...f, precio: Number.parseFloat(f.precio) || 0, idCategoria: f.idCategoria || null }); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 font-display text-xl font-bold text-slate-800">{producto ? 'Editar' : 'Nuevo'} Producto</h2>
        <div className="grid grid-cols-2 gap-3">
          <input name="nombre" placeholder="Nombre" className="input col-span-2" value={f.nombre} onChange={ch} required />
          <input name="descripcion" placeholder="Descripción" className="input col-span-2" value={f.descripcion} onChange={ch} />
          <select name="idCategoria" className="input" value={f.idCategoria} onChange={ch}>
            <option value="">Sin categoría</option>
            {categorias?.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <input name="precio" type="number" step="0.01" placeholder="Precio" className="input" value={f.precio} onChange={ch} required />
          <input name="marca" placeholder="Marca" className="input col-span-2" value={f.marca} onChange={ch} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
          <button type="submit" className="btn-primary">Guardar</button>
        </div>
      </form>
    </div>
  );
}

function TabProductos() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const { data: productos = [], isLoading } = useQuery({ queryKey: ['v2-productos'], queryFn: () => api.get(`${BASE}/productos`).then((r) => r.data) });
  const { data: categorias = [] } = useQuery({ queryKey: ['v2-categorias'], queryFn: () => api.get(`${BASE}/categorias`).then((r) => r.data) });
  const save = useMutation({
    mutationFn: ({ id, data }) => id ? api.put(`${BASE}/productos/${id}`, data) : api.post(`${BASE}/productos`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['v2-productos'] }); setModal(null); toast.success('Producto guardado'); },
    onError: () => toast.error('Error al guardar'),
  });
  const del = useMutation({
    mutationFn: (id) => api.delete(`${BASE}/productos/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['v2-productos'] }); toast.success('Producto eliminado'); },
  });
  const rows = useMemo(() => productos.filter((p) => (p.nombre || '').toLowerCase().includes(search.toLowerCase())), [productos, search]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Buscar producto…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setModal({})} className="btn-primary"><Plus className="h-5 w-5" /> Nuevo</button>
      </div>
      {modal && <ProductoModal producto={modal.id ? modal : null} categorias={categorias} onSave={(d) => save.mutate({ id: modal?.id, data: d })} onClose={() => setModal(null)} />}
      {isLoading ? <Spin /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="p-3 font-semibold">ID</th><th className="p-3 font-semibold">Producto</th><th className="p-3 font-semibold">Categoría</th>
              <th className="p-3 font-semibold">Marca</th><th className="p-3 text-right font-semibold">Precio</th><th className="p-3 text-center font-semibold">Acciones</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono text-xs text-slate-400">{p.id}</td>
                  <td className="p-3 font-medium text-slate-800">{p.nombre}</td>
                  <td className="p-3"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">{p.categoria || '—'}</span></td>
                  <td className="p-3 text-slate-600">{p.marca || '—'}</td>
                  <td className="p-3 text-right font-bold text-slate-900">S/{Number(p.precio ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => setModal({ ...p })} className="mr-1 rounded-lg p-2 text-blue-600 hover:bg-blue-100"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm('¿Eliminar?')) del.mutate(p.id); }} className="rounded-lg p-2 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="py-10 text-center text-slate-400">Sin productos.</div>}
        </div>
      )}
    </div>
  );
}

// ---------------- Clientes ----------------
function ClienteModal({ cliente, onSave, onClose }) {
  const [f, setF] = useState({ nombre: cliente?.nombre || '', apePaterno: cliente?.apePaterno || '', apeMaterno: cliente?.apeMaterno || '' });
  const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const submit = (e) => { e.preventDefault(); onSave(f); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 font-display text-xl font-bold text-slate-800">{cliente ? 'Editar' : 'Nuevo'} Cliente</h2>
        <div className="space-y-3">
          <input name="nombre" placeholder="Nombre(s)" className="input" value={f.nombre} onChange={ch} required />
          <input name="apePaterno" placeholder="Apellido paterno" className="input" value={f.apePaterno} onChange={ch} />
          <input name="apeMaterno" placeholder="Apellido materno" className="input" value={f.apeMaterno} onChange={ch} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
          <button type="submit" className="btn-primary">Guardar</button>
        </div>
      </form>
    </div>
  );
}

function TabClientes() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const { data: clientes = [], isLoading } = useQuery({ queryKey: ['v2-clientes'], queryFn: () => api.get(`${BASE}/clientes`).then((r) => r.data) });
  const save = useMutation({
    mutationFn: ({ id, data }) => id ? api.put(`${BASE}/clientes/${id}`, data) : api.post(`${BASE}/clientes`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['v2-clientes'] }); setModal(null); toast.success('Cliente guardado'); },
    onError: () => toast.error('Error al guardar'),
  });
  const del = useMutation({
    mutationFn: (id) => api.delete(`${BASE}/clientes/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['v2-clientes'] }); toast.success('Cliente eliminado'); },
  });
  const rows = useMemo(() => clientes.filter((c) => `${c.nombre || ''} ${c.apePaterno || ''}`.toLowerCase().includes(search.toLowerCase())), [clientes, search]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Buscar cliente…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setModal({})} className="btn-primary"><Plus className="h-5 w-5" /> Nuevo</button>
      </div>
      {modal && <ClienteModal cliente={modal.id ? modal : null} onSave={(d) => save.mutate({ id: modal?.id, data: d })} onClose={() => setModal(null)} />}
      {isLoading ? <Spin /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="p-3 font-semibold">ID</th><th className="p-3 font-semibold">Nombre</th><th className="p-3 font-semibold">Ap. Paterno</th>
              <th className="p-3 font-semibold">Ap. Materno</th><th className="p-3 text-center font-semibold">Acciones</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono text-xs text-slate-400">{c.id}</td>
                  <td className="p-3 font-medium text-slate-800">{c.nombre || '—'}</td>
                  <td className="p-3 text-slate-600">{c.apePaterno || '—'}</td>
                  <td className="p-3 text-slate-600">{c.apeMaterno || '—'}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => setModal({ ...c })} className="mr-1 rounded-lg p-2 text-blue-600 hover:bg-blue-100"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm('¿Eliminar?')) del.mutate(c.id); }} className="rounded-lg p-2 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="py-10 text-center text-slate-400">Sin clientes.</div>}
        </div>
      )}
    </div>
  );
}

function Spin() {
  return <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-emerald-600" /></div>;
}

export default function CastillonV2Portal() {
  const [tab, setTab] = useState('productos');
  const tabs = [
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'clientes', label: 'Clientes', icon: Users },
  ];
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">Sistema Castillón V2</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <Database className="h-4 w-4" /> Conectado exclusivamente a <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">CASTILLONV2</span>
        </p>
      </div>
      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${tab === t.id ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>
      {tab === 'productos' ? <TabProductos /> : <TabClientes />}
    </Layout>
  );
}
