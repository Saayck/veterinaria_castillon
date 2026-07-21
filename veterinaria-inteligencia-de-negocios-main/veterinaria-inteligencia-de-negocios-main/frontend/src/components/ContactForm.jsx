import { useState } from 'react';
import { toast } from 'sonner';

export default function ContactForm() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('¡Mensaje enviado! Te contactaremos pronto.');
    setForm({ nombre: '', email: '', mensaje: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form bg-white p-8 rounded-2xl shadow-lg space-y-4">
      <h3 className="font-bold text-xl mb-4">Envíanos un mensaje</h3>
      <input
        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        required
      />
      <input
        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <textarea
        className="w-full border p-3 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Mensaje"
        value={form.mensaje}
        onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
        required
      />
      <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold">
        Enviar Mensaje
      </button>
    </form>
  );
}
