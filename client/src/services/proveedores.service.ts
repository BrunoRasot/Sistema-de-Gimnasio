const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const obtenerProveedores = async () => {
  const res = await fetch(`${API_URL}/proveedores`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener proveedores');
  return res.json();
};

export const crearProveedor = async (data: any) => {
  const res = await fetch(`${API_URL}/proveedores`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al crear proveedor');
  return json;
};

export const actualizarProveedor = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/proveedores/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al actualizar proveedor');
  return json;
};

export const eliminarProveedor = async (id: number) => {
  const res = await fetch(`${API_URL}/proveedores/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al eliminar proveedor');
  return json;
};