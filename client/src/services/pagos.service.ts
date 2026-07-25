const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const pagosService = {
  // Métodos de pago
  obtenerMetodos: async () => {
    const res = await fetch(`${API_URL}/pagos/metodos`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener métodos de pago');
    return res.json();
  },
  crearMetodo: async (data: any) => {
    const res = await fetch(`${API_URL}/pagos/metodos`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al crear método');
    return json;
  },
  actualizarMetodo: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/pagos/metodos/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al actualizar método');
    return json;
  },

  // Registro de pagos
  obtenerPagos: async () => {
    const res = await fetch(`${API_URL}/pagos`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener pagos');
    return res.json();
  },
  registrarPago: async (data: any) => {
    const res = await fetch(`${API_URL}/pagos`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al registrar pago');
    return json;
  },
  anularPago: async (id: number) => {
    const res = await fetch(`${API_URL}/pagos/${id}/anular`, { method: 'PATCH', headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al anular pago');
    return json;
  }
};