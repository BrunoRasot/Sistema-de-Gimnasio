import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { tokenService } from '../services/token.service';

export const ProtectedRoute = () => {
  const token = tokenService.getAccessToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const storedUser = localStorage.getItem('usuario');
  let usuario = null;
  try {
    usuario = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    tokenService.clearAccessToken();
  }
  if (!usuario) return <Navigate to="/" replace />;

  const segmento = location.pathname.split('/')[1];
  const modulo = segmento === 'productos' ? 'productos' : segmento;
  const esAdmin = usuario.rol === 'ADMIN' || usuario.rol === 'SUPER_ADMIN';
  const puedeVer = esAdmin || modulo === 'dashboard' || usuario.permisos?.[modulo]?.ver;
  if (!puedeVer) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};
