import { api } from './api';
import { Usuario } from '../types/usuario';

export const obtenerUsuarios = async (
  params: any,
): Promise<{ usuarios: Usuario[]; total: number }> => {
  const cleanParams: Record<string, string> = Object.fromEntries(
    Object.entries(params)
      .filter(([_, v]) => v != null && v !== '')
      .map(([k, v]) => [k, String(v)]),
  );

  const { data } = await api.get('/usuarios', { params: cleanParams });

  return {
    usuarios: data.data,
    total: data.meta.total,
  };
};

export const crearUsuario = async (usuarioData: any) => {
  const { data } = await api.post('/usuarios', usuarioData);
  return data;
};

export const actualizarUsuario = async (id: number, usuarioData: any): Promise<any> => {
  const { data } = await api.put(`/usuarios/${id}`, usuarioData);
  return data;
};

export const eliminarUsuario = async (id: number): Promise<any> => {
  const { data } = await api.delete(`/usuarios/${id}`);
  return data;
};

export const cambiarEstadoCuenta = async (
  id: number,
  estado: 'Activa' | 'Bloqueada' | 'Suspendida',
): Promise<any> => {
  const { data } = await api.patch(`/usuarios/${id}/estado`, { estado });
  return data;
};

export const restablecerPassword = async (id: number, nuevaPassword: string): Promise<any> => {
  const { data } = await api.patch(`/usuarios/${id}/restablecer-password`, { nuevaPassword });
  return data;
};
