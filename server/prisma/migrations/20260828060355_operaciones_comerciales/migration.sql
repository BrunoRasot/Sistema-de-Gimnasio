-- CreateEnum
CREATE TYPE "TipoMovimientoInventario" AS ENUM ('STOCK_INICIAL', 'COMPRA', 'VENTA', 'DEVOLUCION_VENTA', 'DEVOLUCION_PROVEEDOR', 'AJUSTE_ENTRADA', 'AJUSTE_SALIDA', 'MERMA');

-- CreateEnum
CREATE TYPE "EstadoOrdenCompra" AS ENUM ('BORRADOR', 'ENVIADA', 'PARCIAL', 'RECIBIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoCaja" AS ENUM ('ABIERTA', 'CERRADA');

-- CreateEnum
CREATE TYPE "TipoMovimientoCaja" AS ENUM ('INGRESO', 'EGRESO', 'VENTA', 'PAGO', 'DEVOLUCION', 'RETIRO');

-- AlterTable
ALTER TABLE "Configuracion" ADD COLUMN     "facturacionElectronica" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "igvPorcentaje" DECIMAL(5,2) NOT NULL DEFAULT 18,
ADD COLUMN     "proveedorFacturacion" TEXT,
ADD COLUMN     "serieBoleta" TEXT NOT NULL DEFAULT 'B001',
ADD COLUMN     "serieFactura" TEXT NOT NULL DEFAULT 'F001';

-- AlterTable
ALTER TABLE "DetalleVenta" ADD COLUMN     "costoUnitario" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MovimientoInventario" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "tipo" "TipoMovimientoInventario" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "stockAnterior" INTEGER NOT NULL,
    "stockPosterior" INTEGER NOT NULL,
    "costoUnitario" DECIMAL(10,2),
    "referenciaTipo" TEXT,
    "referenciaId" INTEGER,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenCompra" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "estado" "EstadoOrdenCompra" NOT NULL DEFAULT 'BORRADOR',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "impuesto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "fechaEsperada" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdenCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleOrdenCompra" (
    "id" SERIAL NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "cantidadRecibida" INTEGER NOT NULL DEFAULT 0,
    "costoUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "DetalleOrdenCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SesionCaja" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "estado" "EstadoCaja" NOT NULL DEFAULT 'ABIERTA',
    "montoInicial" DECIMAL(12,2) NOT NULL,
    "montoEsperado" DECIMAL(12,2),
    "montoContado" DECIMAL(12,2),
    "diferencia" DECIMAL(12,2),
    "observaciones" TEXT,
    "abiertaAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cerradaAt" TIMESTAMP(3),

    CONSTRAINT "SesionCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoCaja" (
    "id" SERIAL NOT NULL,
    "sesionId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "ventaId" INTEGER,
    "tipo" "TipoMovimientoCaja" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "concepto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoCaja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MovimientoInventario_productoId_createdAt_idx" ON "MovimientoInventario"("productoId", "createdAt");

-- CreateIndex
CREATE INDEX "MovimientoInventario_tipo_idx" ON "MovimientoInventario"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "OrdenCompra_codigo_key" ON "OrdenCompra"("codigo");

-- CreateIndex
CREATE INDEX "OrdenCompra_proveedorId_createdAt_idx" ON "OrdenCompra"("proveedorId", "createdAt");

-- CreateIndex
CREATE INDEX "OrdenCompra_estado_idx" ON "OrdenCompra"("estado");

-- CreateIndex
CREATE INDEX "DetalleOrdenCompra_productoId_idx" ON "DetalleOrdenCompra"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleOrdenCompra_ordenId_productoId_key" ON "DetalleOrdenCompra"("ordenId", "productoId");

-- CreateIndex
CREATE INDEX "SesionCaja_estado_abiertaAt_idx" ON "SesionCaja"("estado", "abiertaAt");

-- CreateIndex
CREATE INDEX "SesionCaja_usuarioId_idx" ON "SesionCaja"("usuarioId");

-- CreateIndex
CREATE INDEX "MovimientoCaja_sesionId_createdAt_idx" ON "MovimientoCaja"("sesionId", "createdAt");

-- AddForeignKey
ALTER TABLE "MovimientoInventario" ADD CONSTRAINT "MovimientoInventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInventario" ADD CONSTRAINT "MovimientoInventario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenCompra" ADD CONSTRAINT "OrdenCompra_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenCompra" ADD CONSTRAINT "OrdenCompra_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleOrdenCompra" ADD CONSTRAINT "DetalleOrdenCompra_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenCompra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleOrdenCompra" ADD CONSTRAINT "DetalleOrdenCompra_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionCaja" ADD CONSTRAINT "SesionCaja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "SesionCaja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
