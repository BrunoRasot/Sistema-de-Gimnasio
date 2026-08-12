import { api } from './api';

export const reportesService = {
  obtenerReporteVentas: async () => {
    const { data } = await api.get('/reportes/ventas');
    return data;
  },
  obtenerReporteMembresias: async () => {
    const { data } = await api.get('/reportes/membresias');
    return data;
  },
  obtenerReporteAsistencias: async () => {
    const { data } = await api.get('/reportes/asistencias');
    return data;
  },
  obtenerReporteInventario: async () => {
    const { data } = await api.get('/reportes/inventario');
    return data;
  },
};
