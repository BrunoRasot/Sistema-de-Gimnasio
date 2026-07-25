const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const reportesService = {
  obtenerReporteVentas: async () => {
    const res = await fetch(`${API_URL}/reportes/ventas`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener reporte de ventas');
    return res.json();
  },
  obtenerReporteMembresias: async () => {
    const res = await fetch(`${API_URL}/reportes/membresias`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener reporte de membresías');
    return res.json();
  },
  obtenerReporteAsistencias: async () => {
    const res = await fetch(`${API_URL}/reportes/asistencias`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener reporte de asistencias');
    return res.json();
  },
  obtenerReporteInventario: async () => {
    const res = await fetch(`${API_URL}/reportes/inventario`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener reporte de inventario');
    return res.json();
  }
};