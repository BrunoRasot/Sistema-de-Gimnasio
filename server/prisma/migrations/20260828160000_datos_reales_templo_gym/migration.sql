ALTER TABLE "Configuracion"
  ADD COLUMN "tipoEmpresa" TEXT NOT NULL DEFAULT 'PERSONA NATURAL CON NEGOCIO',
  ADD COLUMN "fechaInscripcion" TEXT NOT NULL DEFAULT '07/04/2015',
  ADD COLUMN "fechaInicioActividades" TEXT NOT NULL DEFAULT '07/04/2015',
  ADD COLUMN "estadoRuc" TEXT NOT NULL DEFAULT 'ACTIVO',
  ADD COLUMN "condicionRuc" TEXT NOT NULL DEFAULT 'HABIDO';

UPDATE "Configuracion"
SET "nombre" = 'TEMPLO GYM TU GIMNASIO',
    "ruc" = '10218015412',
    "tipoEmpresa" = 'PERSONA NATURAL CON NEGOCIO',
    "fechaInscripcion" = '07/04/2015',
    "fechaInicioActividades" = '07/04/2015',
    "estadoRuc" = 'ACTIVO',
    "condicionRuc" = 'HABIDO'
WHERE "id" = 1;
