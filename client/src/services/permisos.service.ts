const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const obtenerPermisosBD = async () => {
    const res = await fetch(`${API_URL}/permisos`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener permisos');
    return res.json();
};

export const guardarPermisosBD = async (cargo: string, permisos: any) => {
    const res = await fetch(`${API_URL}/permisos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ cargo, permisos })
    });
    if (!res.ok) throw new Error('Error al guardar permisos');
    return res.json();
};