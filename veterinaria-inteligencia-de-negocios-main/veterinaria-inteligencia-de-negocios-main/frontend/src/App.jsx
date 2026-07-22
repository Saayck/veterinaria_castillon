import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';
import CartDrawer from './components/CartDrawer';
import PublicLayout from './components/PublicLayout';
import Inicio from './pages/Inicio';
import Contacto from './pages/Contacto';
import SobreNosotros from './pages/SobreNosotros';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import CatalogMascotas from './pages/CatalogMascotas';
import Consolidado from './pages/Consolidado';

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly }) {
  const { user, isExpired } = useAuth();
  if (!user || isExpired) return <Navigate to="/login" replace />;
  if (adminOnly && user.rol !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, isExpired } = useAuth();
  if (user && !isExpired) return <Navigate to={user.rol === 'ADMIN' ? '/dashboard' : '/consolidado'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
    <Routes>
      <Route path="/" element={<PublicLayout><Inicio /></PublicLayout>} />
      <Route path="/sobre-nosotros" element={<PublicLayout><SobreNosotros /></PublicLayout>} />
      <Route path="/contacto" element={<PublicLayout><Contacto /></PublicLayout>} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/mascotas" element={<CatalogMascotas />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/registro" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/consolidado" element={<ProtectedRoute><Consolidado /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <CartDrawer />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster position="top-right" richColors />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
