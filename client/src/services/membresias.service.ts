const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const obtenerMembresias = async () => {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/miembros`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      throw new Error('No autorizado: Token inválido o expirado');
    }

    if (!response.ok) {
      throw new Error('Error al obtener la lista de membresías');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener membresías:", error);
    throw error;
  }
};