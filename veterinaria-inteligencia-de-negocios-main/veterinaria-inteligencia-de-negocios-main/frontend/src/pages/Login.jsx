import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { LogIn, User, Lock, Database, BarChart3, ArrowLeft } from 'lucide-react';

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
      const destino = user.rol === 'ADMIN' ? '/dashboard' : user.rol === 'CASTILLONV2' ? '/castillonv2' : '/consolidado';
      navigate(destino);
    } catch {
      toast.error('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Panel de marca */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <Link to="/" className="relative z-10 inline-flex items-center gap-2 font-display text-2xl font-bold">
          Consolidado<span className="text-blue-300">.</span>
        </Link>
        <div className="relative z-10">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Inteligencia de Negocios centralizada
          </h1>
          <p className="mt-4 max-w-md text-blue-100">
            Datos unificados de todas las fuentes en una sola plataforma para tomar mejores decisiones.
          </p>
          <div className="mt-8 space-y-3 text-sm text-blue-100">
            <p className="flex items-center gap-3"><Database className="h-5 w-5 text-blue-300" /> Consolidación multi-fuente</p>
            <p className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-blue-300" /> Dashboards y análisis con IA</p>
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
          <h2 className="font-display text-3xl font-bold text-slate-800">Iniciar sesión</h2>
          <p className="mb-8 mt-1 text-sm text-slate-500">Ingresa a tu cuenta para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-10"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-10"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn-primary w-full py-3" disabled={loading}>
              <LogIn className="h-4 w-4" /> {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-blue-600 hover:underline">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
