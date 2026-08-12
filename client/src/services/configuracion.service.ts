import { api } from './api';

export const configuracionService = {
  obtenerConfiguracion: async () => {
    const { data } = await api.get('/configuracion');
    return data;
  },
  obtenerAlertasTiempoReal: async () => {
    const { data } = await api.get('/configuracion/alertas');
    return data;
  },
  actualizarInfo: async (infoData: any) => {
    const { data } = await api.put('/configuracion/info', infoData);
    return data;
  },
  actualizarNotificaciones: async (notificacionesData: any) => {
    const { data } = await api.put('/configuracion/notificaciones', notificacionesData);
    return data;
  },
  cambiarPassword: async (passwordData: any) => {
    const { data } = await api.post('/configuracion/cambiar-password', passwordData);
    return data;
  },
};
