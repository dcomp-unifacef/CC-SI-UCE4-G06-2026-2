/*
  Warnings:

  - Added the required column `idAdministrador` to the `compromissos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "compromissos" ADD COLUMN     "idAdministrador" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "administradores" (
    "idAdministrador" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "senhaHash" VARCHAR(255) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "administradores_pkey" PRIMARY KEY ("idAdministrador")
);

-- CreateIndex
CREATE UNIQUE INDEX "administradores_username_key" ON "administradores"("username");

-- AddForeignKey
ALTER TABLE "compromissos" ADD CONSTRAINT "compromissos_idAdministrador_fkey" FOREIGN KEY ("idAdministrador") REFERENCES "administradores"("idAdministrador") ON DELETE RESTRICT ON UPDATE CASCADE;
