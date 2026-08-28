-- CreateTable
CREATE TABLE "ConteoCaja" (
    "id" SERIAL NOT NULL,
    "sesionId" INTEGER NOT NULL,
    "denominacion" DECIMAL(10,2) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "ConteoCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConciliacionPagoCaja" (
    "id" SERIAL NOT NULL,
    "sesionId" INTEGER NOT NULL,
    "metodoId" INTEGER,
    "metodoNombre" TEXT NOT NULL,
    "esperado" DECIMAL(12,2) NOT NULL,
    "contado" DECIMAL(12,2) NOT NULL,
    "diferencia" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ConciliacionPagoCaja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConteoCaja_sesionId_denominacion_tipo_key" ON "ConteoCaja"("sesionId", "denominacion", "tipo");

-- CreateIndex
CREATE INDEX "ConciliacionPagoCaja_sesionId_idx" ON "ConciliacionPagoCaja"("sesionId");

-- AddForeignKey
ALTER TABLE "ConteoCaja" ADD CONSTRAINT "ConteoCaja_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "SesionCaja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Métodos separados para que el POS y el arqueo distingan cada operador/red.
INSERT INTO "MetodoPago" ("nombre", "descripcion", "activo", "createdAt") VALUES
  ('Efectivo', 'Dinero físico en caja', true, CURRENT_TIMESTAMP),
  ('Yape', 'Billetera digital Yape', true, CURRENT_TIMESTAMP),
  ('Plin', 'Billetera digital Plin', true, CURRENT_TIMESTAMP),
  ('Visa', 'Tarjeta Visa', true, CURRENT_TIMESTAMP),
  ('Mastercard', 'Tarjeta Mastercard', true, CURRENT_TIMESTAMP),
  ('American Express', 'Tarjeta American Express', true, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO UPDATE SET "activo" = true;

-- AddForeignKey
ALTER TABLE "ConciliacionPagoCaja" ADD CONSTRAINT "ConciliacionPagoCaja_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "SesionCaja"("id") ON DELETE CASCADE ON UPDATE CASCADE;
