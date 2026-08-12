import { api } from './api';

export const obtenerCategorias = async () => {
  const { data } = await api.get('/categorias');
  return data;
};

export const crearCategoria = async (data: any) => {
  const { data: res } = await api.post('/categorias', data);
  return res;
};

export const actualizarCategoria = async (id: number, data: any) => {
  const { data: res } = await api.put(`/categorias/${id}`, data);
  return res;
};

export const eliminarCategoria = async (id: number) => {
  const { data: res } = await api.delete(`/categorias/${id}`);
  return res;
};
