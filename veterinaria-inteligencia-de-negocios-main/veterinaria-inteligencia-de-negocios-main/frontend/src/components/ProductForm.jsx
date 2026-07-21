import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ProductForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    idProducto: '',
    nomProducto: '',
    descripcion: '',
    categoria: '',
    precioUnitario: '',
    costoUnitario: '',
    stockActual: '',
    bdOrigen: 'BD_CASTILLON_VETERINARIA',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        idProducto: initial.idProducto || '',
        nomProducto: initial.nomProducto || '',
        descripcion: initial.descripcion || '',
        categoria: initial.categoria || '',
        precioUnitario: initial.precioUnitario || '',
        costoUnitario: initial.costoUnitario || '',
        stockActual: initial.stockActual || '',
        bdOrigen: initial.bdOrigen || 'BD_CASTILLON_VETERINARIA',
      });
    }
  }, [initial]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      precioUnitario: parseFloat(form.precioUnitario) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative">
        <button type="button" onClick={onCancel} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">{initial ? 'Editar Producto' : 'Nuevo Producto'}</h2>

        <div className="grid grid-cols-2 gap-3">
          <input name="idProducto" placeholder="ID Producto" className="border p-2 rounded" value={form.idProducto} onChange={handleChange} required disabled={!!initial} />
          <input name="nomProducto" placeholder="Nombre" className="border p-2 rounded" value={form.nomProducto} onChange={handleChange} required />
          <input name="descripcion" placeholder="Descripción" className="border p-2 rounded col-span-2" value={form.descripcion} onChange={handleChange} />
          <input name="categoria" placeholder="Categoría" className="border p-2 rounded" value={form.categoria} onChange={handleChange} />
          <input name="precioUnitario" type="number" step="0.01" placeholder="Precio" className="border p-2 rounded" value={form.precioUnitario} onChange={handleChange} required />
          <input name="bdOrigen" placeholder="BD Origen" className="border p-2 rounded col-span-2" value={form.bdOrigen} onChange={handleChange} />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
