import { api } from './api';

export const obtenerPlanes = async () => {
  const { data } = await api.get('/planes');
  return data;
};

export const crearPlan = async (data: any) => {
  const { data: res } = await api.post('/planes', data);
  return res;
};

export const actualizarPlan = async (id: number, data: any) => {
  const { data: res } = await api.put(`/planes/${id}`, data);
  return res;
};

export const eliminarPlan = async (id: number) => {
  const { data: res } = await api.delete(`/planes/${id}`);
  return res;
};
