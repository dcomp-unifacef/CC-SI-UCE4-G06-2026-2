-- AlterTable
ALTER TABLE "compromissos" ADD COLUMN     "id_categoria" INTEGER;

-- CreateTable
CREATE TABLE "categoria_compromisso" (
    "id_categoria" SERIAL NOT NULL,
    "nome_categoria" VARCHAR(50) NOT NULL,
    "cor_hex" VARCHAR(7) NOT NULL DEFAULT '#D9D9D9',

    CONSTRAINT "categoria_compromisso_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_compromisso_nome_categoria_key" ON "categoria_compromisso"("nome_categoria");

-- AddForeignKey
ALTER TABLE "compromissos" ADD CONSTRAINT "compromissos_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categoria_compromisso"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;
