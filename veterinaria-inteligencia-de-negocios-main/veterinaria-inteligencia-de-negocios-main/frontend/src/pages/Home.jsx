import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate(user.rol === 'ADMIN' ? '/dashboard' : '/catalog', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <h1 className="text-4xl font-bold mb-2">Sistema Consolidado</h1>
      <p className="text-gray-500 mb-6">Gestión centralizada de productos</p>
      <button
        onClick={() => navigate('/login')}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        Iniciar Sesión <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
