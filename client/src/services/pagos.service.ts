import { api } from './api';

export const pagosService = {
  obtenerMetodos: async () => {
    const { data } = await api.get('/pagos/metodos');
    return data;
  },
  crearMetodo: async (metodoData: any) => {
    const { data } = await api.post('/pagos/metodos', metodoData);
    return data;
  },
  actualizarMetodo: async (id: number, metodoData: any) => {
    const { data } = await api.put(`/pagos/metodos/${id}`, metodoData);
    return data;
  },

  obtenerPagos: async () => {
    const { data } = await api.get('/pagos');
    return data;
  },
  registrarPago: async (pagoData: any) => {
    const { data } = await api.post('/pagos', pagoData);
    return data;
  },
  anularPago: async (id: number) => {
    const { data } = await api.patch(`/pagos/${id}/anular`);
    return data;
  },
};
