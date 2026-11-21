CREATE TABLE "push_subscription" (
    "id_push_subscription" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" VARCHAR(255) NOT NULL,
    "auth" VARCHAR(255) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_administrador" INTEGER NOT NULL,

    CONSTRAINT "push_subscription_pkey" PRIMARY KEY ("id_push_subscription")
);

CREATE UNIQUE INDEX "push_subscription_endpoint_key" ON "push_subscription"("endpoint");
CREATE INDEX "push_subscription_id_administrador_idx" ON "push_subscription"("id_administrador");

ALTER TABLE "push_subscription"
ADD CONSTRAINT "push_subscription_id_administrador_fkey"
FOREIGN KEY ("id_administrador") REFERENCES "administrador"("id_administrador")
ON DELETE CASCADE ON UPDATE CASCADE;
