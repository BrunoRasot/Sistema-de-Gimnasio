import { Navigate, Outlet } from 'react-router-dom';
import { tokenService } from '../services/token.service';

export const ProtectedRoute = () => {
  const token = tokenService.getAccessToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
