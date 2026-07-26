const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const configuracionService = {
  obtenerDatos: async () => {
    const res = await fetch(`${API_URL}/configuracion`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener configuración');
    return res.json();
  },

  actualizarInfo: async (data: any) => {
    const res = await fetch(`${API_URL}/configuracion/info`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al actualizar información');
    return json;
  },

  actualizarNotificaciones: async (data: any) => {
    const res = await fetch(`${API_URL}/configuracion/notificaciones`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al actualizar notificaciones');
    return json;
  },

  cambiarPassword: async (actual: string, nueva: string) => {
    const res = await fetch(`${API_URL}/configuracion/seguridad/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ actual, nueva })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al cambiar contraseña');
    return json;
  }
};