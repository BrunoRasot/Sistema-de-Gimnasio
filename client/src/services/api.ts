import axios from 'axios';
import { tokenService } from './token.service';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Envía y recibe cookies HttpOnly automáticamente
});

// Interceptor para inyectar el Access Token desde la memoria
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar la renovación silenciosa si el Access Token expira (15m)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Petición al backend para renovar el Access Token usando el Refresh Token en la cookie HttpOnly
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (data.token) {
          tokenService.setAccessToken(data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si el refresh token también expiró o es inválido, limpiamos y redirigimos al login
        tokenService.clearAccessToken();
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;