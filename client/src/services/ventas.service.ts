import { api } from './api';
import type { CrearVentaInput, Devolucion, Venta } from '../types/venta';

export const ventasService = {
  obtenerVentas: async (): Promise<Venta[]> => {
    const { data } = await api.get('/ventas');
    return data;
  },

  crearVenta: async (ventaData: CrearVentaInput) => {
    const { data } = await api.post('/ventas', ventaData);
    return data;
  },

  obtenerComprobantePorId: async (id: number): Promise<Venta> => {
    const { data } = await api.get(`/ventas/comprobantes/${id}`);
    return data;
  },

  obtenerDevoluciones: async (): Promise<Devolucion[]> => {
    const { data } = await api.get('/ventas/devoluciones');
    return data;
  },

  registrarDevolucion: async (devolucionData: { identificador: string; motivo: string; items?: Array<{ productoId: number; cantidad: number }> }) => {
    const { data } = await api.post('/ventas/devoluciones', devolucionData);
    return data;
  },
};
