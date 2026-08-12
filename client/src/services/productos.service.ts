import { api } from './api';

export const obtenerProductos = async () => {
  const { data } = await api.get('/productos');
  return data;
};

export const crearProducto = async (data: any) => {
  const { data: res } = await api.post('/productos', data);
  return res;
};

export const actualizarProducto = async (id: number, data: any) => {
  const { data: res } = await api.put(`/productos/${id}`, data);
  return res;
};

export const eliminarProducto = async (id: number) => {
  const { data: res } = await api.delete(`/productos/${id}`);
  return res;
};
