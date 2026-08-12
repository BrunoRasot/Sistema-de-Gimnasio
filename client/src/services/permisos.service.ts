import { api } from './api';

export const obtenerPermisos = async () => {
  const { data } = await api.get('/permisos');
  return data;
};

export const obtenerPermisosBD = async () => {
  const { data } = await api.get('/permisos');
  return data;
};

export const guardarPermisoBD = async (permisosData: { cargo: string; permisos: any }) => {
  const { data } = await api.post('/permisos', permisosData);
  return data;
};

export const guardarPermisosBD = async (permisosData: { cargo: string; permisos: any }) => {
  const { data } = await api.post('/permisos', permisosData);
  return data;
};
