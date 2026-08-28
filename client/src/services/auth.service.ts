import { api } from './api';
import { tokenService } from './token.service';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const solicitar = async (ruta: string, init: RequestInit) => {
  try {
    return await fetch(`${API_URL}${ruta}`, init);
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.');
  }
};

export const loginService = async (usuario: string, password: string) => {
  const response = await solicitar('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, password }),
  });

  if (!response.ok) throw new Error('Credenciales incorrectas');

  const data = await response.json();
  return data;
};

export const verifyOtpService = async (usuario: string, codigo: string) => {
  const response = await solicitar('/auth/verificar-otp', {
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
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
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
    localStorage.removeItem('usuario');
  }
};

const mensajeError = async (response: Response, fallback: string) => {
  const data = await response.json().catch(() => ({}));
  return typeof data.mensaje === 'string' ? data.mensaje : fallback;
};

export const solicitarRecuperacionService = async (identificador: string) => {
  const response = await solicitar('/auth/solicitar-recuperacion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identificador }),
  });
  if (!response.ok) throw new Error(await mensajeError(response, 'No se pudo solicitar la recuperación.'));
  return response.json();
};

export const restablecerPasswordService = async (identificador: string, codigo: string, nuevaPassword: string) => {
  const response = await solicitar('/auth/restablecer-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identificador, codigo, nuevaPassword }),
  });
  if (!response.ok) throw new Error(await mensajeError(response, 'No se pudo cambiar la contraseña.'));
  return response.json();
};
