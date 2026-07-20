const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const obtenerPlanes = async () => {
  const res = await fetch(`${API_URL}/planes`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener planes');
  return res.json();
};

export const crearPlan = async (data: any) => {
  const res = await fetch(`${API_URL}/planes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear plan');
  return res.json();
};

export const actualizarPlan = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/planes/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar plan');
  return res.json();
};

export const eliminarPlan = async (id: number) => {
  const res = await fetch(`${API_URL}/planes/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar plan');
  return res.json();
};