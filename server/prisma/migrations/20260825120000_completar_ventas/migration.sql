ALTER TYPE "EstadoTransaccion" ADD VALUE IF NOT EXISTS 'ParcialmenteDevuelto';
ALTER TYPE "EstadoTransaccion" ADD VALUE IF NOT EXISTS 'Devuelto';

ALTER TABLE "Venta"
  ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0;

UPDATE "Venta" SET "subtotal" = "total" WHERE "subtotal" = 0;

CREATE UNIQUE INDEX IF NOT EXISTS "DetalleDevolucion_devolucionId_productoId_key"
  ON "DetalleDevolucion"("devolucionId", "productoId");
