export interface MetodoPagoVenta { id: number; nombre: string; activo?: boolean }
export interface ProductoDetalleVenta { id: number; nombre: string; sku?: string }
export interface DetalleVenta { id?: number; productoId: number; cantidad: number; precioUnit: number | string; subtotal: number | string; producto?: ProductoDetalleVenta }
export interface Venta {
  id: number; codigo: string; cliente?: string | null; miembroId?: number | null;
  subtotal?: number | string; descuento?: number | string; total: number | string;
  numeroOperacion?: string | null; montoRecibido?: number | string | null; vuelto?: number | string | null;
  estado: 'Pendiente' | 'Completado' | 'ParcialmenteDevuelto' | 'Devuelto' | 'Anulado';
  createdAt: string; metodoId: number; metodoPago: MetodoPagoVenta; detalles: DetalleVenta[];
  pagos?: Array<{ id: number; metodoId: number; monto: number | string; numeroOperacion?: string | null; metodo: MetodoPagoVenta }>;
  usuario?: { id: number; nombres: string; apellidos: string } | null;
  comprobanteFiscal?: { id: number; tipo: string; estado: string; proveedor: string; clienteTipoDoc?: string | null; clienteNumeroDoc?: string | null; clienteRazonSocial?: string | null; clienteDireccion?: string | null; serie?: string | null; correlativo?: string | null; fechaEmision?: string | null; enlaceConsulta?: string | null; observaciones?: string | null } | null;
}
export interface Devolucion { id: number; ventaId: number; monto: number | string; motivo: string; createdAt: string; venta: Venta; detalles?: DetalleVenta[] }
export interface CrearVentaInput { cliente?: string; miembroId?: number; metodoId?: number; numeroOperacion?: string; montoRecibido?: number; descuento?: number; pagos?: Array<{ metodoId: number; monto: number; numeroOperacion?: string }>; items: Array<{ productoId: number; cantidad: number }> }
