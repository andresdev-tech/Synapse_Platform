/*
  Warnings:

  - You are about to drop the `programas_descripciones` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "programas_descripciones" DROP CONSTRAINT "programas_descripciones_programa_id_fkey";

-- AlterTable
ALTER TABLE "programas" ADD COLUMN     "descripcion" TEXT;

-- DropTable
DROP TABLE "programas_descripciones";
