ALTER TABLE "Plan"
  ADD CONSTRAINT "Plan_precio_nonnegative" CHECK ("precio" >= 0),
  ADD CONSTRAINT "Plan_duracion_positive" CHECK ("duracionDias" > 0);

ALTER TABLE "Membresia"
  ADD CONSTRAINT "Membresia_monto_nonnegative" CHECK ("montoPagado" >= 0),
  ADD CONSTRAINT "Membresia_fechas_validas" CHECK ("fechaFin" >= "fechaInicio");

ALTER TABLE "Producto"
  ADD CONSTRAINT "Producto_precio_compra_nonnegative" CHECK ("precioCompra" >= 0),
  ADD CONSTRAINT "Producto_precio_venta_nonnegative" CHECK ("precioVenta" >= 0),
  ADD CONSTRAINT "Producto_stock_nonnegative" CHECK ("stock" >= 0),
  ADD CONSTRAINT "Producto_stock_minimo_nonnegative" CHECK ("stockMinimo" >= 0);

ALTER TABLE "Venta"
  ADD CONSTRAINT "Venta_total_nonnegative" CHECK ("total" >= 0),
  ADD CONSTRAINT "Venta_monto_recibido_nonnegative" CHECK ("montoRecibido" IS NULL OR "montoRecibido" >= 0),
  ADD CONSTRAINT "Venta_vuelto_nonnegative" CHECK ("vuelto" IS NULL OR "vuelto" >= 0);

ALTER TABLE "DetalleVenta"
  ADD CONSTRAINT "DetalleVenta_cantidad_positive" CHECK ("cantidad" > 0),
  ADD CONSTRAINT "DetalleVenta_precio_nonnegative" CHECK ("precioUnit" >= 0),
  ADD CONSTRAINT "DetalleVenta_subtotal_nonnegative" CHECK ("subtotal" >= 0);

ALTER TABLE "Devolucion"
  ADD CONSTRAINT "Devolucion_monto_nonnegative" CHECK ("monto" >= 0);

ALTER TABLE "DetalleDevolucion"
  ADD CONSTRAINT "DetalleDevolucion_cantidad_positive" CHECK ("cantidad" > 0),
  ADD CONSTRAINT "DetalleDevolucion_subtotal_nonnegative" CHECK ("subtotal" >= 0);

ALTER TABLE "Pago"
  ADD CONSTRAINT "Pago_monto_positive" CHECK ("monto" > 0);

CREATE INDEX "Membresia_miembroId_idx" ON "Membresia"("miembroId");
CREATE INDEX "Membresia_planId_idx" ON "Membresia"("planId");
CREATE INDEX "Auditoria_usuarioId_idx" ON "Auditoria"("usuarioId");
CREATE INDEX "Auditoria_createdAt_idx" ON "Auditoria"("createdAt");
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");
CREATE INDEX "Producto_proveedorId_idx" ON "Producto"("proveedorId");
CREATE INDEX "Venta_usuarioId_idx" ON "Venta"("usuarioId");
CREATE INDEX "Venta_miembroId_idx" ON "Venta"("miembroId");
CREATE INDEX "Venta_metodoId_idx" ON "Venta"("metodoId");
CREATE INDEX "DetalleVenta_ventaId_idx" ON "DetalleVenta"("ventaId");
CREATE INDEX "DetalleVenta_productoId_idx" ON "DetalleVenta"("productoId");
CREATE INDEX "Devolucion_ventaId_idx" ON "Devolucion"("ventaId");
CREATE INDEX "Devolucion_usuarioId_idx" ON "Devolucion"("usuarioId");
CREATE INDEX "DetalleDevolucion_devolucionId_idx" ON "DetalleDevolucion"("devolucionId");
CREATE INDEX "DetalleDevolucion_productoId_idx" ON "DetalleDevolucion"("productoId");
CREATE INDEX "Pago_usuarioId_idx" ON "Pago"("usuarioId");
CREATE INDEX "Pago_miembroId_idx" ON "Pago"("miembroId");
CREATE INDEX "Pago_metodoId_idx" ON "Pago"("metodoId");
CREATE INDEX "asistencias_miembroId_idx" ON "asistencias"("miembroId");
CREATE INDEX "RefreshToken_usuarioId_idx" ON "RefreshToken"("usuarioId");
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");
