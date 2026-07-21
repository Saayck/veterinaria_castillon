import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular un pequeño retraso de red para dar feedback visual
    setTimeout(() => {
      toast.success('¡Mensaje enviado con éxito! Te responderemos en breve.');
      setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <div 
        className="relative text-white py-24 px-6 bg-cover bg-center"
        style={{ backgroundImage: 'url("/contact-hero.png")' }}
      >
        <div className="absolute inset-0 bg-blue-900/60 mix-blend-multiply"></div>
        <div className="relative max-w-6xl mx-auto text-center z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Estamos aquí para ayudarte
          </h1>
          <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto font-light drop-shadow-md">
            ¿Tienes alguna duda sobre nuestros productos, problemas con tu pedido o necesitas asesoría veterinaria? Nuestro equipo de soporte está listo para asistirte.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow max-w-6xl mx-auto px-6 py-12 mt-4 w-full">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column - Contact Info */}
          <div className="bg-blue-50 rounded-2xl shadow-xl p-10 md:w-2/5 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de Contacto</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Llena el formulario y nuestro equipo se pondrá en contacto contigo dentro de las próximas 24 horas hábiles.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm text-blue-600">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Teléfono</h3>
                    <p className="text-gray-600 mt-1">+1 (809) 555-0100</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm text-blue-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Correo Electrónico</h3>
                    <p className="text-gray-600 mt-1">soporte@consolidado.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm text-blue-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ubicación Principal</h3>
                    <p className="text-gray-600 mt-1">Av. Winston Churchill #123<br/>Santo Domingo, República Dominicana</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h3 className="font-semibold text-gray-900 mb-4">Horario de Atención</h3>
              <p className="text-gray-600 text-sm">Lunes - Viernes: 8:00 AM - 6:00 PM</p>
              <p className="text-gray-600 text-sm">Sábados: 9:00 AM - 1:00 PM</p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white rounded-2xl shadow-xl p-10 md:w-3/5">
            <div className="flex items-center gap-2 mb-8">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Envíanos un Mensaje</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                  <input
                    type="text"
                    className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                    placeholder="Ej. Juan Pérez"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <input
                    type="email"
                    className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                    placeholder="juan@ejemplo.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Asunto</label>
                <input
                  type="text"
                  className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                  placeholder="¿En qué podemos ayudarte?"
                  value={form.asunto}
                  onChange={(e) => setForm({ ...form, asunto: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mensaje</label>
                <textarea
                  className="w-full border-gray-300 border p-3 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm resize-none"
                  placeholder="Describe tu consulta con el mayor detalle posible..."
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition font-bold text-lg flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? 'Enviando...' : (
                  <>Enviar Mensaje <Send className="w-5 h-5" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
