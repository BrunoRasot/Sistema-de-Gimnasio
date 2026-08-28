import { api } from './api';

export const produccionService = {
  listarCartera: async (estado?: string) => (await api.get('/cartera', { params: estado ? { estado } : {} })).data,
  crearCuenta: async (data: unknown) => (await api.post('/cartera', data)).data,
  registrarAbono: async (id: number, data: unknown) => (await api.post(`/cartera/${id}/abonos`, data)).data,
  anularCuenta: async (id: number) => (await api.patch(`/cartera/${id}/anular`)).data,
  listarFiscal: async (search?: string) => (await api.get('/fiscal', { params: search ? { search } : {} })).data,
  actualizarFiscal: async (ventaId: number, data: unknown) => (await api.put(`/fiscal/${ventaId}`, data)).data,
  listarAuditoria: async (params?: Record<string, unknown>) => (await api.get('/control/auditoria', { params })).data,
  obtenerAlertas: async () => (await api.get('/control/alertas')).data,
  descargarCsv: async (tipo: string) => {
    const { data } = await api.get(`/control/exportar/${tipo}`, { responseType: 'blob' });
    const url = URL.createObjectURL(data); const link = document.createElement('a');
    link.href = url; link.download = `${tipo}-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  },
};
