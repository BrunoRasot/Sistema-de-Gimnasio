/// <reference types="vite/client" />
import axios from 'axios';
import { tokenService } from './token.service';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

const solicitarRenovacion = async () => axios.post(
  `${api.defaults.baseURL}/auth/refresh-token`,
  {},
  { withCredentials: true },
);

export const renovarSesion = async () => {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('templogym-refresh-session', solicitarRenovacion);
  }
  return solicitarRenovacion();
};

api.interceptors.request.use((config) => {
  const token = tokenService.getAccessToken();
  if (token && config.headers) {
    const cleanToken = token.replace(/^["']|["']$/g, '');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      error.message = 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.';
    }
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }

    const originalRequest = error.config;

    if (originalRequest.url?.includes('/auth/refresh-token')) {
      tokenService.clearAccessToken();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await renovarSesion();

        const cleanToken = data.token.replace(/^["']|["']$/g, '');
        tokenService.setAccessToken(cleanToken);
        originalRequest.headers.Authorization = `Bearer ${cleanToken}`;

        processQueue(null, cleanToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenService.clearAccessToken();
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
