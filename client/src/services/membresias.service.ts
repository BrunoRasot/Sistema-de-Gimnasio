import { api } from './api';

export const obtenerMembresias = async () => {
  const { data } = await api.get('/miembros');
  return data;
};
