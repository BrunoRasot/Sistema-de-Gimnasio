import { api } from './api'; // Tu instancia configurada de Axios o fetch
import { tokenService } from './token.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const loginService = async (usuario: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, password }),
  });

  if (!response.ok) throw new Error('Credenciales incorrectas');

  const data = await response.json();
  return data;
};

export const verifyOtpService = async (usuario: string, codigo: string) => {
  const response = await fetch(`${API_URL}/auth/verificar-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ usuario, codigo }),
  });

  if (!response.ok) throw new Error('Código inválido o expirado');

  const data = await response.json();

  if (data.token) {
    tokenService.setAccessToken(data.token);

    if (data.usuario) {
      localStorage.setItem('usuarioRol', data.usuario.rol || 'USER');
      localStorage.setItem('usuarioCargo', data.usuario.cargo || '');
    }
  }

  return data;
};

export const logoutService = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Error al notificar cierre de sesión al servidor', error);
  } finally {
    tokenService.clearAccessToken();
    localStorage.removeItem('usuarioRol');
    localStorage.removeItem('usuarioCargo');
  }
};
