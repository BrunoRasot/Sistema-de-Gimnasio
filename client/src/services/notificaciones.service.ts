const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const notificacionesService = {
  obtenerAlertasSistema: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/configuracion/alertas-tiempo-real`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener alertas');
    return res.json();
  }
};