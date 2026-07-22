const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const obtenerProductos = async () => {
  const res = await fetch(`${API_URL}/productos`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener inventario');
  return res.json();
};

export const crearProducto = async (data: any) => {
  const res = await fetch(`${API_URL}/productos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al crear producto');
  return json;
};

export const actualizarProducto = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/productos/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al actualizar producto');
  return json;
};

export const eliminarProducto = async (id: number) => {
  const res = await fetch(`${API_URL}/productos/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al eliminar producto');
  return json;
};