CREATE TABLE "VentaPago" (
  "id" SERIAL NOT NULL,
  "ventaId" INTEGER NOT NULL,
  "metodoId" INTEGER NOT NULL,
  "monto" DECIMAL(10,2) NOT NULL,
  "numeroOperacion" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VentaPago_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "VentaPago_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "VentaPago_metodoId_fkey" FOREIGN KEY ("metodoId") REFERENCES "MetodoPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "VentaPago_ventaId_idx" ON "VentaPago"("ventaId");
CREATE INDEX "VentaPago_metodoId_idx" ON "VentaPago"("metodoId");
CREATE UNIQUE INDEX "VentaPago_ventaId_metodoId_key" ON "VentaPago"("ventaId", "metodoId");

INSERT INTO "VentaPago" ("ventaId", "metodoId", "monto", "numeroOperacion")
SELECT "id", "metodoId", "total", "numeroOperacion" FROM "Venta";
