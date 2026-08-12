import { api } from './api';

export const obtenerProveedores = async () => {
  const { data } = await api.get('/proveedores');
  return data;
};

export const crearProveedor = async (data: any) => {
  const { data: res } = await api.post('/proveedores', data);
  return res;
};

export const actualizarProveedor = async (id: number, data: any) => {
  const { data: res } = await api.put(`/proveedores/${id}`, data);
  return res;
};

export const eliminarProveedor = async (id: number) => {
  const { data: res } = await api.delete(`/proveedores/${id}`);
  return res;
};
