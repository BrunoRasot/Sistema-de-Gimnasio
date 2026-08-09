/*
  Warnings:

  - You are about to drop the column `rol` on the `Permiso` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cargo,modulo]` on the table `Permiso` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cargo` to the `Permiso` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Permiso_rol_modulo_key";

-- AlterTable
ALTER TABLE "Permiso" DROP COLUMN "rol",
ADD COLUMN     "cargo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "cargo" TEXT NOT NULL DEFAULT 'Recepcionista';

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_cargo_modulo_key" ON "Permiso"("cargo", "modulo");
