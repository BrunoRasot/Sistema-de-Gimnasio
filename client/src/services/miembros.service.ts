import { api } from './api';

export const obtenerMiembros = async () => {
  const { data } = await api.get('/miembros');
  return data;
};

export const buscarClienteDni = async (dni: string) => {
  const { data } = await api.get(`/miembros/buscar/${dni}`);
  return data;
};

export const asignarMembresia = async (membresiaData: any) => {
  const { data } = await api.post('/miembros/asignar-membresia', membresiaData);
  return data;
};

export const crearMiembro = async (miembroData: any) => {
  const { data } = await api.post('/miembros', miembroData);
  return data;
};

export const renovarMembresia = async (id: number, renovacionData: any) => {
  const { data } = await api.post(`/miembros/${id}/renovar`, renovacionData);
  return data;
};

export const crearCliente = async (clienteData: any) => {
  const { data } = await api.post('/miembros/cliente', clienteData);
  return data;
};

export const inactivarCliente = async (id: number) => {
  const { data } = await api.patch(`/miembros/${id}/inactivar`);
  return data;
};
