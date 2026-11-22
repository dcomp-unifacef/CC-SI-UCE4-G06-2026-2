# Front-end

Aplicação React + TypeScript para o site institucional e o painel administrativo da API.

## Executar localmente

1. Configure `DATABASE_URL` em `back-end/.env` e inicie a API:

   ```bash
   cd back-end
   npm install
   npm run dev
   ```

2. Em outro terminal, inicie o front-end:

   ```bash
   cd front-end
   cp .env.local.example .env.local
   npm install
   npm run dev
   ```

Durante o desenvolvimento, o Vite encaminha requisições de `/api` para `VITE_BACKEND_URL` (por padrão `http://localhost:8888`) e remove o prefixo antes de enviá-las à API. Em produção, o backend serve os arquivos compilados do front e a API na mesma origem; deixe `VITE_API_URL` sem definir para usar caminhos relativos. Se o front e a API forem publicados separadamente, configure `VITE_API_URL` com a URL-base pública da API e ajuste CORS e cookies para essa arquitetura.

## Notificações push

Para receber lembretes com o painel fechado, configure `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `VAPID_SUBJECT` em `back-end/.env`. Gere um par uma única vez com `npx web-push generate-vapid-keys` no diretório `back-end`; mantenha a chave privada apenas nas variáveis de ambiente do servidor. A origem do painel publicado deve usar HTTPS (localhost é aceito pelos navegadores para desenvolvimento).

Depois de configurar o banco e as chaves, aplique as migrações pendentes:

```bash
cd back-end
npx prisma migrate deploy
```

O backend verifica os lembretes a cada minuto; portanto, precisa permanecer em execução para entregá-los. No painel, abra o sino no cabeçalho e escolha **Ativar** para permitir notificações neste dispositivo. A permissão também pode ser revogada nas configurações do navegador.

## Scripts

- `npm run dev`: inicia o servidor Vite.
- `npm run build`: verifica os projetos TypeScript e cria `dist/`.
- `npm run preview`: serve localmente a versão construída.
- `npm run lint`: executa Oxlint.

O painel usa `POST /administradores/autenticar` para iniciar uma sessão por cookie HttpOnly. As rotas administrativas exigem uma sessão válida; ao servir front e API na mesma origem, o navegador pode enviar esse cookie sem depender de cookies de terceiros.