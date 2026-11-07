/*
  Warnings:

  - You are about to drop the column `idAdministrador` on the `compromissos` table. All the data in the column will be lost.
  - You are about to drop the `administradores` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_administrador` to the `compromissos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "compromissos" DROP CONSTRAINT "compromissos_idAdministrador_fkey";

-- AlterTable
ALTER TABLE "compromissos" DROP COLUMN "idAdministrador",
ADD COLUMN     "id_administrador" INTEGER NOT NULL;

-- DropTable
DROP TABLE "administradores";

-- CreateTable
CREATE TABLE "administrador" (
    "id_administrador" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "administrador_pkey" PRIMARY KEY ("id_administrador")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrador_username_key" ON "administrador"("username");

-- AddForeignKey
ALTER TABLE "compromissos" ADD CONSTRAINT "compromissos_id_administrador_fkey" FOREIGN KEY ("id_administrador") REFERENCES "administrador"("id_administrador") ON DELETE RESTRICT ON UPDATE CASCADE;
