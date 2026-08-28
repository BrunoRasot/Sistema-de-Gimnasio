import { api } from './api';
export const operacionesService = {
  kardex: async (productoId?: number) => (await api.get('/inventario/kardex', { params: productoId ? { productoId } : {} })).data,
  ajustar: async (data: { productoId: number; cantidad: number; motivo: string }) => (await api.post('/inventario/ajustes', data)).data,
  ordenes: async () => (await api.get('/compras')).data,
  crearOrden: async (data: unknown) => (await api.post('/compras', data)).data,
  recibir: async (id: number, items: { detalleId: number; cantidad: number }[]) => (await api.post(`/compras/${id}/recepciones`, { items })).data,
  cajaActual: async () => (await api.get('/caja/actual')).data,
  historialCajas: async () => (await api.get('/caja/historial')).data,
  abrirCaja: async (montoInicial: number) => (await api.post('/caja/abrir', { montoInicial })).data,
  moverCaja: async (data: { tipo: string; monto: number; concepto: string }) => (await api.post('/caja/movimientos', data)).data,
  cerrarCaja: async (data: { conteo: { denominacion: number; cantidad: number; tipo: string }[]; conciliaciones: { metodoId?: number | null; metodoNombre: string; contado: number }[]; observaciones?: string }) => (await api.post('/caja/cerrar', data)).data,
};
