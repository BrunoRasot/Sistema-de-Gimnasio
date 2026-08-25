import { api } from './api';

export const ventasService = {
  obtenerVentas: async () => {
    const { data } = await api.get('/ventas');
    return data;
  },

  crearVenta: async (ventaData: {
    cliente: string;
    metodoId: number;
    numeroOperacion?: string;
    montoRecibido?: number;
    vuelto?: number;
    items: any[];
  }) => {
    const { data } = await api.post('/ventas', ventaData);
    return data;
  },

  obtenerComprobantePorId: async (id: number) => {
    const { data } = await api.get(`/ventas/comprobantes/${id}`);
    return data;
  },

  obtenerDevoluciones: async () => {
    const { data } = await api.get('/ventas/devoluciones');
    return data;
  },

  registrarDevolucion: async (devolucionData: { identificador: string; motivo: string }) => {
    const { data } = await api.post('/ventas/devoluciones', devolucionData);
    return data;
  },
};
