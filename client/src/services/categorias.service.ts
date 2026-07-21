const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const obtenerCategorias = async () => {
  const res = await fetch(`${API_URL}/categorias`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener categorías');
  return res.json();
};

export const crearCategoria = async (data: any) => {
  const res = await fetch(`${API_URL}/categorias`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al crear categoría');
  return json;
};

export const actualizarCategoria = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al actualizar categoría');
  return json;
};

export const eliminarCategoria = async (id: number) => {
  const res = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.mensaje || 'Error al eliminar categoría');
  return json;
};