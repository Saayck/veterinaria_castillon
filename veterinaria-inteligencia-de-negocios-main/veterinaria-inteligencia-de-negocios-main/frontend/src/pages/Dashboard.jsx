import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';


function ProductModal({ producto, categorias, unidades, onSave, onClose }) {
  const [form, setForm] = useState({
    nomProducto: producto?.nomProducto || '',
    descripcion: producto?.descripcion || '',
    idCategoria: producto?.idCategoria || '',
    idUnidad: producto?.idUnidad || '',
    precioUnitario: producto?.precioUnitario || '',
    stockActual: producto?.stockActual || '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, precioUnitario: parseFloat(form.precioUnitario) || 0, stockActual: parseInt(form.stockActual) || 0 });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{producto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <input name="nomProducto" placeholder="Nombre" className="border p-2 rounded col-span-2" value={form.nomProducto} onChange={handleChange} required />
          <input name="descripcion" placeholder="Descripción" className="border p-2 rounded col-span-2" value={form.descripcion} onChange={handleChange} />
          <select name="idCategoria" className="border p-2 rounded" value={form.idCategoria} onChange={handleChange}>
            <option value="">Sin categoría</option>
            {categorias?.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select name="idUnidad" className="border p-2 rounded" value={form.idUnidad} onChange={handleChange}>
            <option value="">Sin unidad</option>
            {unidades?.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
          </select>
          <input name="precioUnitario" type="number" step="0.01" placeholder="Precio" className="border p-2 rounded" value={form.precioUnitario} onChange={handleChange} required />
          <input name="stockActual" type="number" placeholder="Stock" className="border p-2 rounded" value={form.stockActual} onChange={handleChange} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
        </div>
      </form>
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null);
  const container = useRef(null);

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos', isAdmin],
    queryFn: () => api.get(isAdmin ? '/api/admin/productos' : '/api/catalogo/productos').then((r) => r.data),
  });

  useGSAP(() => {
    if (productos.length > 0 && !isLoading) {
      gsap.fromTo('.table-row', 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
      gsap.fromTo('.dashboard-title',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, { scope: container, dependencies: [productos, isLoading] });

  const { data: categorias = [] } = useQuery({
    queryKey: ['admin-categorias'],
    queryFn: () => api.get('/api/admin/categorias').then((r) => r.data),
  });

  const { data: unidades = [] } = useQuery({
    queryKey: ['admin-unidades'],
    queryFn: () => api.get('/api/admin/unidades').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, data }) => id ? api.put(`/api/admin/productos/${id}`, data) : api.post('/api/admin/productos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-productos'] });
      setModal(null);
      toast.success('Producto guardado');
    },
    onError: () => toast.error('Error al guardar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/admin/productos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-productos'] });
      toast.success('Producto eliminado');
    },
  });

  return (
    <Layout>
      <div ref={container}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="dashboard-title text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">Gestión de Productos</h1>
          {isAdmin && (
            <button onClick={() => setModal({})} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2 font-medium">
              <Plus className="w-5 h-5" /> Nuevo Producto
            </button>
          )}
        </div>

      {modal && (
        <ProductModal
          producto={modal.id ? modal : null}
          categorias={categorias}
          unidades={unidades}
          onSave={(data) => saveMutation.mutate({ id: modal?.id, data })}
          onClose={() => setModal(null)}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600">
                <th className="p-4 text-left font-semibold">ID</th>
                <th className="p-4 text-left font-semibold">Producto</th>
                <th className="p-4 text-left font-semibold">Categoría</th>
                <th className="p-4 text-left font-semibold">Unidad</th>
                <th className="p-4 text-right font-semibold">Precio</th>
                <th className="p-4 text-right font-semibold">Stock</th>
                {isAdmin && <th className="p-4 text-center font-semibold">Estado</th>}
                {isAdmin && <th className="p-4 text-center font-semibold">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productos.map((p) => (
                <tr key={p.idProducto} className="table-row hover:bg-blue-50/50 transition-colors">
                  <td className="p-4 text-gray-500 font-mono text-xs">{p.idProducto}</td>
                  <td className="p-4 font-semibold text-gray-800">{p.nomProducto}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">{p.categoria || 'Sin categoría'}</span>
                  </td>
                  <td className="p-4 text-gray-600">{p.unidad || '-'}</td>
                  <td className="p-4 text-right font-bold text-gray-900">S/{p.precioUnitario?.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.stockActual > 10 ? 'text-green-700 bg-green-100' : p.stockActual > 0 ? 'text-orange-700 bg-orange-100' : 'text-red-700 bg-red-100'}`}>
                      {p.stockActual ?? 0}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.estado === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.estado === '1' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  )}
                  {isAdmin && (
                    <td className="p-4 text-center">
                      <button onClick={() => setModal({ ...p, id: p.idProducto })} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors mr-1">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm('¿Eliminar?')) deleteMutation.mutate(p.idProducto); }} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {productos.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No hay productos registrados
            </div>
          )}
        </div>
      )}
      </div>
    </Layout>
  );
}
