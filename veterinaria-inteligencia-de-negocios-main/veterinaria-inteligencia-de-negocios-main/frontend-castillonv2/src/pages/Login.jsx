import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { LogIn, User, Lock, Database, Package } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(username, password);
      toast.success(`Bienvenido, ${user.username}`);
      navigate('/portal');
    } catch {
      toast.error('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Panel de marca */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-700 to-green-800 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <span className="relative z-10 inline-flex items-center gap-2 font-display text-2xl font-bold">
          Castillón V2<span className="text-emerald-300">.</span>
        </span>
        <div className="relative z-10">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Sistema operacional Castillón V2
          </h1>
          <p className="mt-4 max-w-md text-emerald-100">
            Gestión de productos y clientes conectada exclusivamente a la base CASTILLONV2.
          </p>
          <div className="mt-8 space-y-3 text-sm text-emerald-100">
            <p className="flex items-center gap-3"><Database className="h-5 w-5 text-emerald-300" /> Base de datos: CASTILLONV2</p>
            <p className="flex items-center gap-3"><Package className="h-5 w-5 text-emerald-300" /> CRUD de productos y clientes</p>
          </div>
        </div>
        <p className="relative z-10 text-xs text-emerald-200">© 2025 Sistema Castillón V2</p>
      </div>

      {/* Formulario */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-3xl font-bold text-slate-800">Iniciar sesión</h2>
          <p className="mb-8 mt-1 text-sm text-slate-500">Portal del sistema Castillón V2</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10" placeholder="Usuario" value={username}
                onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10" type="password" placeholder="Contraseña" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:shadow-md hover:brightness-110 disabled:opacity-60 inline-flex items-center justify-center gap-2" disabled={loading}>
              <LogIn className="h-4 w-4" /> {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
