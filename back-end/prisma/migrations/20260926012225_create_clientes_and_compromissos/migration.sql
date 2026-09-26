-- CreateTable
CREATE TABLE "clientes" (
    "idCliente" SERIAL NOT NULL,
    "nomeEmpresa" TEXT NOT NULL,
    "nomeResponsavel" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ramo" TEXT,
    "participouLicitacoes" BOOLEAN NOT NULL DEFAULT false,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("idCliente")
);

-- CreateTable
CREATE TABLE "compromissos" (
    "idCompromisso" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "horarioInicio" TEXT NOT NULL,
    "horarioFim" TEXT,
    "pregao" TEXT,
    "statusCompromisso" TEXT NOT NULL DEFAULT 'Pendente',
    "antecedenciaAlerta" INTEGER NOT NULL DEFAULT 1,
    "idCliente" INTEGER NOT NULL,

    CONSTRAINT "compromissos_pkey" PRIMARY KEY ("idCompromisso")
);

-- AddForeignKey
ALTER TABLE "compromissos" ADD CONSTRAINT "compromissos_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "clientes"("idCliente") ON DELETE CASCADE ON UPDATE CASCADE;
