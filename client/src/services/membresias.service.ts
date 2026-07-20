const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const obtenerMembresias = async () => {
  // 1. Intentamos obtener el token del almacenamiento local
  const token = localStorage.getItem('token'); // Asegúrate de que esta sea la llave correcta (o 'accessToken')

  try {
    const response = await fetch(`${API_URL}/miembros`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 2. Enviamos el token en el encabezado Authorization
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