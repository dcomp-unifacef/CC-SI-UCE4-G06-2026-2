/*
  Warnings:

  - You are about to drop the column `idCliente` on the `compromissos` table. All the data in the column will be lost.
  - You are about to drop the `clientes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "compromissos" DROP CONSTRAINT "compromissos_idCliente_fkey";

-- AlterTable
ALTER TABLE "compromissos" DROP COLUMN "idCliente",
ADD COLUMN     "id_cliente" INTEGER;

-- DropTable
DROP TABLE "clientes";

-- CreateTable
CREATE TABLE "cliente" (
    "id_cliente" SERIAL NOT NULL,
    "razao_social_nome" VARCHAR(150) NOT NULL,
    "cnpj_cpf" VARCHAR(20),
    "telefone_whatsapp" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100),
    "ramo_atuacao" VARCHAR(100),
    "origem_contato" VARCHAR(50) NOT NULL DEFAULT 'Site',
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_cnpj_cpf_key" ON "cliente"("cnpj_cpf");

-- AddForeignKey
ALTER TABLE "compromissos" ADD CONSTRAINT "compromissos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE SET NULL ON UPDATE CASCADE;
