/*
  Migration para alinhamento da tabela compromissos com o Diagrama de Classes REV00
  e Diagrama de Banco de Dados REV01, com preservação integral e conversão segura de dados legados.
*/

-- 1. Renomeação padronizada da Chave Primária
ALTER TABLE "compromissos"
  RENAME COLUMN "idCompromisso" TO "id_compromisso";

-- 2. Adição das novas colunas previstas nos diagramas REV00/REV01
ALTER TABLE "compromissos"
  ALTER COLUMN "titulo" TYPE VARCHAR(150),
  ADD COLUMN "data_hora_inicio" TIMESTAMP(3),
  ADD COLUMN "data_hora_fim" TIMESTAMP(3),
  ADD COLUMN "concluido" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "alerta_emitido" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "antecedencia_alerta_minutos" INTEGER DEFAULT 1440,
  ADD COLUMN "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 3. Conversão precisa de 'data' + 'horarioInicio' para 'data_hora_inicio'
UPDATE "compromissos"
SET "data_hora_inicio" = CASE
  WHEN "horarioInicio" ~ '^[0-2]?[0-9]:[0-5][0-9]' THEN
    ("data"::date + substring("horarioInicio" from '^[0-2]?[0-9]:[0-5][0-9]')::time)::timestamp(3)
  ELSE
    "data"
END
WHERE "data_hora_inicio" IS NULL;

-- 4. Conversão precisa de 'data' + 'horarioFim' para 'data_hora_fim' (quando houver)
UPDATE "compromissos"
SET "data_hora_fim" = CASE
  WHEN "horarioFim" IS NOT NULL AND "horarioFim" ~ '^[0-2]?[0-9]:[0-5][0-9]' THEN
    ("data"::date + substring("horarioFim" from '^[0-2]?[0-9]:[0-5][0-9]')::time)::timestamp(3)
  ELSE
    NULL
END
WHERE "data_hora_fim" IS NULL;

-- 5. Preservação do status de conclusão (concluido)
UPDATE "compromissos"
SET "concluido" = true
WHERE "statusCompromisso" ILIKE '%conclu%';

-- 6. Conversão de dias para minutos na antecedência de alerta (ex: 1 dia -> 1440 min)
UPDATE "compromissos"
SET "antecedencia_alerta_minutos" = CASE
  WHEN "antecedenciaAlerta" IS NOT NULL AND "antecedenciaAlerta" > 0 THEN "antecedenciaAlerta" * 1440
  ELSE 1440
END;

-- 7. Preservar informação de pregão na descrição caso preenchida
UPDATE "compromissos"
SET "descricao" = CASE
  WHEN "pregao" IS NOT NULL AND trim("pregao") <> '' THEN
    CASE
      WHEN "descricao" IS NOT NULL AND trim("descricao") <> '' THEN "descricao" || ' (Pregão: ' || "pregao" || ')'
      ELSE 'Pregão: ' || "pregao"
    END
  ELSE "descricao"
END;

-- 8. Aplicar constraint NOT NULL na dataHoraInicio após migração dos dados
ALTER TABLE "compromissos"
  ALTER COLUMN "data_hora_inicio" SET NOT NULL;

-- 9. Remoção segura das colunas antigas substituídas
ALTER TABLE "compromissos"
  DROP COLUMN "data",
  DROP COLUMN "horarioInicio",
  DROP COLUMN "horarioFim",
  DROP COLUMN "pregao",
  DROP COLUMN "statusCompromisso",
  DROP COLUMN "antecedenciaAlerta";
