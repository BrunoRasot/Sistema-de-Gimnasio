import { api } from './api';

export const buscarPorDni = async (dni: string) => {
  const { data } = await api.get(`/asistencias/buscar/${dni}`);
  return data;
};

export const registrarAsistencia = async (asistenciaData: { miembroId: number }) => {
  const { data } = await api.post('/asistencias/registrar', asistenciaData);
  return data;
};

export const obtenerAsistenciasHoy = async () => {
  const { data } = await api.get('/asistencias/hoy');
  return data;
};
