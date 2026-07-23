import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import CastillonV2Portal from './pages/CastillonV2Portal';

// ============================================================
// Frontend EXCLUSIVO del sistema Castillón V2 (BD: CASTILLONV2).
// Es un software independiente que consume el MISMO backend
// (endpoints /api/sistemas/castillonv2/**).
// ============================================================

const queryClient = new QueryClient();

function AccesoDenegado() {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
      <h1 className="font-display text-2xl font-bold text-slate-800">Sin acceso a este sistema</h1>
      <p className="text-slate-500">
        Este portal es exclusivo del sistema <b>Castillón V2</b>.<br />
        Ingresa con la cuenta <b>castillonv2</b> (o una de administrador).
      </p>
      <button onClick={logout} className="btn-primary">Cambiar de cuenta</button>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, isExpired } = useAuth();
  if (!user || isExpired) return <Navigate to="/login" replace />;
  if (user.rol !== 'CASTILLONV2' && user.rol !== 'ADMIN') return <AccesoDenegado />;
  return children;
}

function GuestRoute({ children }) {
  const { user, isExpired } = useAuth();
  if (user && !isExpired) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/" element={<ProtectedRoute><CastillonV2Portal /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
