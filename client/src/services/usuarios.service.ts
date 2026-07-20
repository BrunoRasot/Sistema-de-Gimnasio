import { Usuario } from '../types/usuario';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const obtenerUsuarios = async (params: any): Promise<{ usuarios: Usuario[], total: number }> => {
  const cleanParams: Record<string, string> = Object.fromEntries(
    Object.entries(params)
      .filter(([_, v]) => v != null && v !== '')
      .map(([k, v]) => [k, String(v)]) 
  );
  
  const query = new URLSearchParams(cleanParams).toString();
  
  const res = await fetch(`${API_URL}/usuarios?${query}`, { 
    headers: getHeaders() 
  });
  

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.mensaje || 'Error al cargar usuarios');
  }

  const json = await res.json();

  return {
    usuarios: json.data,
    total: json.meta.total
  };
};

export const crearUsuario = async (data: any) => {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.mensaje || 'Error desconocido al crear usuario');
  }

  return res.json();
};

export const actualizarUsuario = async (id: number, data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al actualizar');

  return json;
};

export const eliminarUsuario = async (id: number): Promise<any> => {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al eliminar');

  return json;
};

export const cambiarEstadoCuenta = async (id: number, estado: 'Activa' | 'Bloqueada' | 'Suspendida'): Promise<any> => {
  const res = await fetch(`${API_URL}/usuarios/${id}/estado`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ estado })
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al cambiar estado');

  return json;
};

export const restablecerPassword = async (id: number, nuevaPassword: string): Promise<any> => {
  const res = await fetch(`${API_URL}/usuarios/${id}/restablecer-password`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ nuevaPassword })
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al restablecer contraseña');

  return json;
};