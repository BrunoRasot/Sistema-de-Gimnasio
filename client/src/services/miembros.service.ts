const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const obtenerMiembros = async () => {
  const res = await fetch(`${API_URL}/miembros`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener miembros');
  return res.json();
};

export const buscarClienteDni = async (dni: string) => {
  const res = await fetch(`${API_URL}/miembros/buscar/${dni}`, { headers: getHeaders() });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.mensaje || 'Error al buscar cliente');
  }
  return res.json();
};

export const asignarMembresia = async (data: any) => {
  const res = await fetch(`${API_URL}/miembros/asignar-membresia`, {
    method: 'POST',
    headers: getHeaders(), // 👈 CORREGIDO
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.mensaje || 'Error al asignar membresía');
  }
  return res.json();
};

export const crearMiembro = async (data: any) => {
  const res = await fetch(`${API_URL}/miembros`, {
    method: 'POST',
    headers: getHeaders(), 
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.mensaje || 'Error desconocido al crear miembro');
  }
  return res.json();
};

export const renovarMembresia = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/miembros/${id}/renovar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al renovar');
  return res.json();
};

export const crearCliente = async (data: any) => {
  const res = await fetch(`${API_URL}/miembros/cliente`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.mensaje || 'Error al crear cliente');
  }
  return res.json();
};

export const inactivarCliente = async (id: number) => {
  const res = await fetch(`${API_URL}/miembros/${id}/inactivar`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.mensaje || 'Error al inactivar cliente');
  }
  return res.json();
};