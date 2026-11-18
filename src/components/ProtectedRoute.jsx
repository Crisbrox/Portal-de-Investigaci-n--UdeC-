/**
 * components/ProtectedRoute.jsx
 * Guarda de rutas: requiere sesión (y opcionalmente rol ADMIN).
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Cargando() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-udec-100 border-t-udec-700" />
      <p className="text-sm font-medium text-udec-700">Verificando sesión institucional…</p>
    </div>
  );
}

/**
 * adminOnly: solo administradores. roles: lista de roles permitidos (el administrador siempre entra).
 */
export default function ProtectedRoute({ children, adminOnly = false, roles = null }) {
  const { autenticado, esAdmin, cargando, usuario } = useAuth();
  const location = useLocation();

  if (cargando) return <Cargando />;

  if (!autenticado) {
    return <Navigate to="/acceso" replace state={{ desde: location.pathname + location.search }} />;
  }
  // Cuenta nueva o restablecida: primero debe cambiar la contraseña temporal
  if (usuario?.debe_cambiar_password && location.pathname !== '/panel/cambiar-password') {
    return <Navigate to="/panel/cambiar-password" replace />;
  }
  if (adminOnly && !esAdmin) {
    return <Navigate to="/panel" replace />;
  }
  if (roles && !esAdmin && !roles.includes(usuario?.rol)) {
    return <Navigate to="/panel" replace />;
  }
  return children;
}
