const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const ventasService = {
  obtenerVentas: async () => {
    const res = await fetch(`${API_URL}/ventas`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener el historial de ventas');
    return res.json();
  },

  crearVenta: async (data: {
    cliente: string;
    metodoPago: string;
    numeroOperacion?: string;
    montoRecibido?: number;
    vuelto?: number;
    items: any[]
  }) => {
    const res = await fetch(`${API_URL}/ventas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al registrar venta');
    return json;
  },

  obtenerComprobantePorId: async (id: number) => {
    const res = await fetch(`${API_URL}/ventas/comprobantes/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener el comprobante');
    return res.json();
  },

  obtenerDevoluciones: async () => {
    const res = await fetch(`${API_URL}/ventas/devoluciones`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener las devoluciones');
    return res.json();
  },

  registrarDevolucion: async (data: { identificador: string; motivo: string }) => {
    const res = await fetch(`${API_URL}/ventas/devoluciones`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al registrar devolución');
    return json;
  }
};