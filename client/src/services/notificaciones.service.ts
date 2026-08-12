import { api } from './api';

export const notificacionesService = {
  obtenerAlertasSistema: async (): Promise<any[]> => {
    const { data } = await api.get('/configuracion/alertas-tiempo-real');
    return data;
  },
};
