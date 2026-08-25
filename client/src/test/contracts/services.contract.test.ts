import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../services/api';
import * as asistencias from '../../services/asistencias.service';
import * as categorias from '../../services/categorias.service';
import { configuracionService } from '../../services/configuracion.service';
import * as miembros from '../../services/miembros.service';
import { pagosService } from '../../services/pagos.service';
import * as permisos from '../../services/permisos.service';
import * as planes from '../../services/planes.service';
import * as productos from '../../services/productos.service';
import * as proveedores from '../../services/proveedores.service';
import { reportesService } from '../../services/reportes.service';
import * as usuarios from '../../services/usuarios.service';
import { ventasService } from '../../services/ventas.service';

vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(),
  },
}));

describe('Contratos de los gateways HTTP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
      vi.mocked(api[method]).mockResolvedValue({ data: { ok: true } });
    }
  });

  it('asistencias usa sus tres endpoints', async () => {
    await asistencias.buscarPorDni('12345678');
    await asistencias.registrarAsistencia({ miembroId: 9 });
    await asistencias.obtenerAsistenciasHoy();
    expect(api.get).toHaveBeenCalledWith('/asistencias/buscar/12345678');
    expect(api.post).toHaveBeenCalledWith('/asistencias/registrar', { miembroId: 9 });
    expect(api.get).toHaveBeenCalledWith('/asistencias/hoy');
  });

  it('categorías conserva rutas y verbos CRUD', async () => {
    await categorias.obtenerCategorias();
    await categorias.crearCategoria({ nombre: 'A' });
    await categorias.actualizarCategoria(2, { nombre: 'B' });
    await categorias.eliminarCategoria(2);
    expect(api.get).toHaveBeenCalledWith('/categorias');
    expect(api.post).toHaveBeenCalledWith('/categorias', { nombre: 'A' });
    expect(api.put).toHaveBeenCalledWith('/categorias/2', { nombre: 'B' });
    expect(api.delete).toHaveBeenCalledWith('/categorias/2');
  });

  it('configuración usa endpoints separados para información, alertas y seguridad', async () => {
    await configuracionService.obtenerDatos();
    await configuracionService.obtenerAlertasTiempoReal();
    await configuracionService.actualizarInfo({ nombre: 'Gym' });
    await configuracionService.actualizarNotificaciones({ stockBajo: true });
    await configuracionService.cambiarPassword({ actual: 'a', nueva: 'b' });
    expect(api.get).toHaveBeenCalledWith('/configuracion');
    expect(api.get).toHaveBeenCalledWith('/configuracion/alertas-tiempo-real');
    expect(api.put).toHaveBeenCalledWith('/configuracion/info', { nombre: 'Gym' });
    expect(api.put).toHaveBeenCalledWith('/configuracion/notificaciones', { stockBajo: true });
    expect(api.post).toHaveBeenCalledWith('/configuracion/cambiar-password', { actual: 'a', nueva: 'b' });
  });

  it('membresías conserva alta, búsqueda, asignación, renovación e inactivación', async () => {
    await miembros.obtenerMiembros();
    await miembros.buscarClienteDni('12345678');
    await miembros.crearCliente({ dni: '12345678' });
    await miembros.asignarMembresia({ miembroId: 1, planId: 2 });
    await miembros.renovarMembresia(1, { planId: 3 });
    await miembros.inactivarCliente(1);
    expect(api.get).toHaveBeenCalledWith('/miembros');
    expect(api.get).toHaveBeenCalledWith('/miembros/buscar/12345678');
    expect(api.post).toHaveBeenCalledWith('/miembros/cliente', { dni: '12345678' });
    expect(api.post).toHaveBeenCalledWith('/miembros/asignar-membresia', { miembroId: 1, planId: 2 });
    expect(api.post).toHaveBeenCalledWith('/miembros/1/renovar', { planId: 3 });
    expect(api.patch).toHaveBeenCalledWith('/miembros/1/inactivar');
  });

  it('pagos conserva métodos, registros y anulación', async () => {
    await pagosService.obtenerMetodos();
    await pagosService.crearMetodo({ nombre: 'Yape' });
    await pagosService.actualizarMetodo(3, { activo: false });
    await pagosService.obtenerPagos();
    await pagosService.registrarPago({ monto: 10 });
    await pagosService.anularPago(4);
    expect(api.get).toHaveBeenCalledWith('/pagos/metodos');
    expect(api.put).toHaveBeenCalledWith('/pagos/metodos/3', { activo: false });
    expect(api.patch).toHaveBeenCalledWith('/pagos/4/anular');
  });

  it('permisos lee y guarda la matriz completa', async () => {
    await permisos.obtenerPermisosBD();
    await permisos.guardarPermisosBD({ cargo: 'Cajero', permisos: {} });
    expect(api.get).toHaveBeenCalledWith('/permisos');
    expect(api.post).toHaveBeenCalledWith('/permisos', { cargo: 'Cajero', permisos: {} });
  });

  it('planes conserva rutas CRUD', async () => {
    await planes.obtenerPlanes();
    await planes.crearPlan({ nombre: 'Mensual' });
    await planes.actualizarPlan(2, { nombre: 'Anual' });
    await planes.eliminarPlan(2);
    expect(api.get).toHaveBeenCalledWith('/planes');
    expect(api.put).toHaveBeenCalledWith('/planes/2', { nombre: 'Anual' });
    expect(api.delete).toHaveBeenCalledWith('/planes/2');
  });

  it('productos y proveedores conservan sus contratos CRUD', async () => {
    await productos.crearProducto({ sku: 'A' });
    await productos.actualizarProducto(1, { sku: 'B' });
    await productos.eliminarProducto(1);
    await proveedores.crearProveedor({ nombre: 'P' });
    await proveedores.actualizarProveedor(2, { nombre: 'Q' });
    await proveedores.eliminarProveedor(2);
    expect(api.post).toHaveBeenCalledWith('/productos', { sku: 'A' });
    expect(api.delete).toHaveBeenCalledWith('/productos/1');
    expect(api.post).toHaveBeenCalledWith('/proveedores', { nombre: 'P' });
    expect(api.delete).toHaveBeenCalledWith('/proveedores/2');
  });

  it('reportes consulta los cuatro agregados', async () => {
    await reportesService.obtenerReporteVentas();
    await reportesService.obtenerReporteMembresias();
    await reportesService.obtenerReporteAsistencias();
    await reportesService.obtenerReporteInventario();
    for (const reporte of ['ventas', 'membresias', 'asistencias', 'inventario']) {
      expect(api.get).toHaveBeenCalledWith(`/reportes/${reporte}`);
    }
  });

  it('usuarios filtra parámetros vacíos y conserva acciones administrativas', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [], meta: { total: 0 } } });
    await usuarios.obtenerUsuarios({ buscar: '', pagina: 1, limite: null, rol: 'USER' });
    expect(api.get).toHaveBeenCalledWith('/usuarios', { params: { pagina: '1', rol: 'USER' } });
    await usuarios.crearUsuario({ nombreUsuario: 'user' });
    await usuarios.actualizarUsuario(1, { cargo: 'Cajero' });
    await usuarios.cambiarEstadoCuenta(1, 'Bloqueada');
    await usuarios.restablecerPassword(1, 'Password-123!');
    await usuarios.eliminarUsuario(1);
    expect(api.patch).toHaveBeenCalledWith('/usuarios/1/estado', { estado: 'Bloqueada' });
    expect(api.patch).toHaveBeenCalledWith('/usuarios/1/restablecer-password', { nuevaPassword: 'Password-123!' });
  });

  it('ventas conserva historial, comprobante, alta y devolución', async () => {
    await ventasService.obtenerVentas();
    await ventasService.crearVenta({ cliente: 'Público', metodoId: 1, items: [] });
    await ventasService.obtenerComprobantePorId(5);
    await ventasService.obtenerDevoluciones();
    await ventasService.registrarDevolucion({ identificador: 'VNT-1', motivo: 'Error' });
    expect(api.get).toHaveBeenCalledWith('/ventas/comprobantes/5');
    expect(api.post).toHaveBeenCalledWith('/ventas/devoluciones', { identificador: 'VNT-1', motivo: 'Error' });
  });
});
