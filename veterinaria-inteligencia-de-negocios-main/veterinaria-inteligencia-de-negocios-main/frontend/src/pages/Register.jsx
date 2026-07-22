import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { UserPlus, User, Lock, Eye, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const user = await register(username, password);
      toast.success(`Cuenta creada. ¡Bienvenido, ${user.username}!`);
      navigate('/consolidado');
    } catch (err) {
      const msg = err.response?.status === 409
        ? 'El nombre de usuario ya está en uso'
        : err.response?.data?.detalles || 'No se pudo crear la cuenta';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Panel de marca */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-800 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <Link to="/" className="relative z-10 inline-flex items-center gap-2 font-display text-2xl font-bold">
          Consolidado<span className="text-blue-300">.</span>
        </Link>
        <div className="relative z-10">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Crea tu cuenta gratuita
          </h1>
          <p className="mt-4 max-w-md text-blue-100">
            Accede a la consola consolidada y explora los indicadores del negocio en modo consulta.
          </p>
          <div className="mt-8 flex items-center gap-3 rounded-xl bg-white/10 p-4 text-sm text-blue-50">
            <Eye className="h-5 w-5 shrink-0 text-blue-200" />
            Las cuentas nuevas tienen acceso de <b className="mx-1">solo lectura</b> a la información consolidada.
          </div>
        </div>
        <p className="relative z-10 text-xs text-blue-200">© 2025 Sistema Consolidado</p>
      </div>

      {/* Formulario */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600 lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
          <h2 className="font-display text-3xl font-bold text-slate-800">Crear cuenta</h2>
          <p className="mb-8 mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Acceso de solo lectura a la consola
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10" placeholder="Usuario" value={username} minLength={3}
                onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10" type="password" placeholder="Contraseña (mínimo 6)" value={password} minLength={6}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10" type="password" placeholder="Repetir contraseña" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <button className="btn-primary w-full py-3" disabled={loading}>
              <UserPlus className="h-4 w-4" /> {loading ? 'Creando...' : 'Registrarse'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
