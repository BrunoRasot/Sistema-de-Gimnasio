CREATE TYPE "TipoComprobanteFiscal" AS ENUM ('TICKET_INTERNO', 'BOLETA', 'FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO');
CREATE TYPE "EstadoComprobanteFiscal" AS ENUM ('NO_APLICA', 'PENDIENTE', 'EMITIDO', 'ACEPTADO', 'RECHAZADO', 'ANULADO');
CREATE TYPE "ProveedorEmisionFiscal" AS ENUM ('NINGUNO', 'SEE_SOL', 'PSE', 'OSE');
CREATE TYPE "EstadoCuentaCobrar" AS ENUM ('PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA', 'ANULADA');

CREATE TABLE "ComprobanteFiscal" (
  "id" SERIAL PRIMARY KEY,
  "ventaId" INTEGER NOT NULL UNIQUE REFERENCES "Venta"("id") ON DELETE CASCADE,
  "tipo" "TipoComprobanteFiscal" NOT NULL DEFAULT 'TICKET_INTERNO',
  "estado" "EstadoComprobanteFiscal" NOT NULL DEFAULT 'NO_APLICA',
  "proveedor" "ProveedorEmisionFiscal" NOT NULL DEFAULT 'NINGUNO',
  "clienteTipoDoc" TEXT, "clienteNumeroDoc" TEXT, "clienteRazonSocial" TEXT, "clienteDireccion" TEXT,
  "serie" TEXT, "correlativo" TEXT, "fechaEmision" TIMESTAMP(3), "enlaceConsulta" TEXT,
  "archivoPdf" TEXT, "archivoXml" TEXT, "archivoCdr" TEXT, "observaciones" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "ComprobanteFiscal_serie_correlativo_key" ON "ComprobanteFiscal"("serie", "correlativo");
CREATE INDEX "ComprobanteFiscal_estado_createdAt_idx" ON "ComprobanteFiscal"("estado", "createdAt");

CREATE TABLE "CuentaCobrar" (
  "id" SERIAL PRIMARY KEY, "codigo" TEXT NOT NULL UNIQUE, "miembroId" INTEGER NOT NULL REFERENCES "Miembro"("id"),
  "membresiaId" INTEGER UNIQUE REFERENCES "Membresia"("id"), "concepto" TEXT NOT NULL,
  "montoTotal" DECIMAL(12,2) NOT NULL, "saldo" DECIMAL(12,2) NOT NULL,
  "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "fechaVencimiento" TIMESTAMP(3) NOT NULL,
  "estado" "EstadoCuentaCobrar" NOT NULL DEFAULT 'PENDIENTE', "observaciones" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CuentaCobrar_montos_check" CHECK ("montoTotal" > 0 AND "saldo" >= 0 AND "saldo" <= "montoTotal")
);
CREATE INDEX "CuentaCobrar_estado_fechaVencimiento_idx" ON "CuentaCobrar"("estado", "fechaVencimiento");
CREATE INDEX "CuentaCobrar_miembroId_idx" ON "CuentaCobrar"("miembroId");

CREATE TABLE "AbonoCuentaCobrar" (
  "id" SERIAL PRIMARY KEY, "cuentaId" INTEGER NOT NULL REFERENCES "CuentaCobrar"("id"),
  "metodoId" INTEGER NOT NULL REFERENCES "MetodoPago"("id"), "usuarioId" INTEGER REFERENCES "Usuario"("id"),
  "monto" DECIMAL(12,2) NOT NULL, "numeroOperacion" TEXT, "observaciones" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AbonoCuentaCobrar_monto_check" CHECK ("monto" > 0)
);
CREATE INDEX "AbonoCuentaCobrar_cuentaId_createdAt_idx" ON "AbonoCuentaCobrar"("cuentaId", "createdAt");
CREATE INDEX "AbonoCuentaCobrar_metodoId_idx" ON "AbonoCuentaCobrar"("metodoId");
