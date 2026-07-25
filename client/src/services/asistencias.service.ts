const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const buscarPorDni = async (dni: string) => {
  const res = await fetch(`${API_URL}/asistencias/buscar/${dni}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Miembro no encontrado');
  return res.json();
};

export const registrarAsistencia = async (miembroId: number) => {
  const res = await fetch(`${API_URL}/asistencias/registrar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ miembroId })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al registrar asistencia');
  return json;
};

export const obtenerAsistenciasHoy = async () => {
  const res = await fetch(`${API_URL}/asistencias/hoy`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener asistencias');
  return res.json();
};