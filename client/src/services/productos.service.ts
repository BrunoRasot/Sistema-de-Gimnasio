const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const obtenerProductos = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/productos`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Error al obtener inventario');
  return response.json();
};
