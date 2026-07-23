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
import Clientes from './pages/Clientes';

const queryClient = new QueryClient();

// Página de inicio según el rol tras iniciar sesión.
function homeFor(rol) {
  if (rol === 'ADMIN') return '/dashboard';
  if (rol === 'CASTILLONV2') return '/castillonv2';
  return '/consolidado';
}

// El sistema Castillón V2 ahora tiene su PROPIO frontend (carpeta frontend-castillonv2, puerto 5174).
// Esta pantalla solo redirige al portal correcto.
function PortalV2Redirect() {
  const { logout } = useAuth();
  const v2Url = window.location.hostname === 'localhost'
    ? 'http://localhost:5174'
    : 'https://castillonv2-castillon.loca.lt';
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      <h1 className="font-display text-2xl font-bold text-slate-900">El sistema Castillón V2 tiene su propio portal</h1>
      <p className="max-w-md text-slate-600">
        Los productos y clientes de <strong>Castillón V2</strong> se gestionan desde su propio software,
        conectado exclusivamente a la base de datos <strong>CASTILLONV2</strong>.
      </p>
      <a href={v2Url} className="btn-primary">Ir al portal Castillón V2</a>
      <button onClick={logout} className="btn-ghost text-sm">Cerrar sesión</button>
    </div>
  );
}

function ProtectedRoute({ children, roles }) {
  const { user, isExpired } = useAuth();
  if (!user || isExpired) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to={homeFor(user.rol)} replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, isExpired } = useAuth();
  if (user && !isExpired) return <Navigate to={homeFor(user.rol)} replace />;
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
      <Route path="/dashboard" element={<ProtectedRoute roles={['ADMIN']}><Dashboard /></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute roles={['ADMIN']}><Clientes /></ProtectedRoute>} />
      <Route path="/consolidado" element={<ProtectedRoute roles={['ADMIN', 'USER']}><Consolidado /></ProtectedRoute>} />
      <Route path="/castillonv2" element={<ProtectedRoute roles={['ADMIN', 'CASTILLONV2']}><PortalV2Redirect /></ProtectedRoute>} />
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
