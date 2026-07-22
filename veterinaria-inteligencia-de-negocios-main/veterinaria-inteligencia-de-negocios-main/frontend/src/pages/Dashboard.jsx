import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Plus, Pencil, Trash2, Database } from 'lucide-react';

const SISTEMAS = [
  { id: 'veterinaria', label: 'Veterinaria Castillón', bd: 'BD_CASTILLON_VETERINARIA' },
  { id: 'castillonv2', label: 'Castillón V2', bd: 'CASTILLONV2' },
];

function ProductModal({ producto, sistema, categorias, unidades, onSave, onClose }) {
  const isVet = sistema === 'veterinaria';
  const [form, setForm] = useState({
    nombre: producto?.nombre || '',
    descripcion: producto?.descripcion || '',
    idCategoria: producto?.idCategoria || '',
    idUnidad: producto?.idUnidad || '',
    precio: producto?.precio ?? '',
    stock: producto?.stock ?? '',
    marca: producto?.marca || '',
  });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    onSave({
      nombre: form.nombre,
      descripcion: form.descripcion,
      idCategoria: form.idCategoria || null,
      idUnidad: isVet ? (form.idUnidad || null) : null,
      precio: Number.parseFloat(form.precio) || 0,
      stock: isVet ? (Number.parseInt(form.stock, 10) || 0) : null,
      marca: isVet ? null : form.marca,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 font-display text-xl font-bold text-slate-800">{producto ? 'Editar' : 'Nuevo'} Producto</h2>
        <div className="grid grid-cols-2 gap-3">
          <input name="nombre" placeholder="Nombre" className="input col-span-2" value={form.nombre} onChange={change} required />
          <input name="descripcion" placeholder="Descripción" className="input col-span-2" value={form.descripcion} onChange={change} />
          <select name="idCategoria" className="input" value={form.idCategoria} onChange={change}>
            <option value="">Sin categoría</option>
            {categorias?.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <input name="precio" type="number" step="0.01" placeholder="Precio" className="input" value={form.precio} onChange={change} required />
          {isVet ? (
            <>
              <select name="idUnidad" className="input" value={form.idUnidad} onChange={change}>
                <option value="">Sin unidad</option>
                {unidades?.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
              <input name="stock" type="number" placeholder="Stock" className="input" value={form.stock} onChange={change} />
            </>
          ) : (
            <input name="marca" placeholder="Marca" className="input col-span-2" value={form.marca} onChange={change} />
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
          <button type="submit" className="btn-primary">Guardar</button>
        </div>
      </form>
    </div>
  );
}

function normCatalogo(p) {
  return { id: p.idProducto, nombre: p.nomProducto, categoria: p.categoria, unidad: p.unidad, precio: p.precioUnitario, stock: p.stockActual, estado: '1', marca: '' };
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [sistema, setSistema] = useState('veterinaria');
  const [modal, setModal] = useState(null);
  const container = useRef(null);
  const isVet = sistema === 'veterinaria';

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos', isAdmin, sistema],
    queryFn: () => isAdmin
      ? api.get(`/api/sistemas/${sistema}/productos`).then((r) => r.data)
      : api.get('/api/catalogo/productos').then((r) => r.data.map(normCatalogo)),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ['sis-categorias', sistema], enabled: isAdmin,
    queryFn: () => api.get(`/api/sistemas/${sistema}/categorias`).then((r) => r.data),
  });
  const { data: unidades = [] } = useQuery({
    queryKey: ['sis-unidades', sistema], enabled: isAdmin && isVet,
    queryFn: () => api.get(`/api/sistemas/${sistema}/unidades`).then((r) => r.data),
  });

  useGSAP(() => {
    if (productos.length > 0 && !isLoading) {
      gsap.fromTo('.table-row', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out' });
    }
  }, { scope: container, dependencies: [productos, isLoading] });

  const saveMutation = useMutation({
    mutationFn: ({ id, data }) => id
      ? api.put(`/api/sistemas/${sistema}/productos/${id}`, data)
      : api.post(`/api/sistemas/${sistema}/productos`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['productos'] }); setModal(null); toast.success('Producto guardado'); },
    onError: () => toast.error('Error al guardar'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/sistemas/${sistema}/productos/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['productos'] }); toast.success('Producto eliminado'); },
    onError: () => toast.error('Error al eliminar'),
  });

  return (
    <Layout>
      <div ref={container}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Gestión de Productos</h1>
            {isAdmin && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Database className="h-4 w-4" /> Sistema conectado a
                <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${isVet ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {SISTEMAS.find((s) => s.id === sistema)?.bd}
                </span>
              </p>
            )}
          </div>
          {isAdmin && (
            <button onClick={() => setModal({})} className="btn-primary">
              <Plus className="h-5 w-5" /> Nuevo Producto
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="mb-4 flex flex-wrap gap-2">
            {SISTEMAS.map((s) => (
              <button key={s.id} onClick={() => setSistema(s.id)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${sistema === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {modal && (
          <ProductModal
            producto={modal.id ? modal : null}
            sistema={sistema}
            categorias={categorias}
            unidades={unidades}
            onSave={(data) => saveMutation.mutate({ id: modal?.id, data })}
            onClose={() => setModal(null)}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-left text-gray-600">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Producto</th>
                  <th className="p-4 font-semibold">Categoría</th>
                  <th className="p-4 font-semibold">{isVet ? 'Unidad' : 'Marca'}</th>
                  <th className="p-4 text-right font-semibold">Precio</th>
                  {isVet && <th className="p-4 text-right font-semibold">Stock</th>}
                  {isAdmin && <th className="p-4 text-center font-semibold">Estado</th>}
                  {isAdmin && <th className="p-4 text-center font-semibold">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productos.map((p) => (
                  <tr key={p.id} className="table-row transition-colors hover:bg-blue-50/50">
                    <td className="p-4 font-mono text-xs text-gray-500">{p.id}</td>
                    <td className="p-4 font-semibold text-gray-800">{p.nombre}</td>
                    <td className="p-4"><span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">{p.categoria || 'Sin categoría'}</span></td>
                    <td className="p-4 text-gray-600">{(isVet ? p.unidad : p.marca) || '-'}</td>
                    <td className="p-4 text-right font-bold text-gray-900">S/{Number(p.precio ?? 0).toFixed(2)}</td>
                    {isVet && (
                      <td className="p-4 text-right">
                        <span className={`rounded px-2 py-1 text-xs font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{p.stock ?? '—'}</span>
                      </td>
                    )}
                    {isAdmin && (
                      <td className="p-4 text-center">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${p.estado === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.estado === '1' ? 'Activo' : 'Inactivo'}</span>
                      </td>
                    )}
                    {isAdmin && (
                      <td className="p-4 text-center">
                        <button onClick={() => setModal({ ...p })} className="mr-1 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-100"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => { if (confirm('¿Eliminar?')) deleteMutation.mutate(p.id); }} className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {productos.length === 0 && <div className="py-10 text-center text-gray-500">No hay productos registrados</div>}
          </div>
        )}
      </div>
    </Layout>
  );
}
