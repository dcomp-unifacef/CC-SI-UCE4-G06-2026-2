# Copilot instructions

## Project architecture

- The application is an Express 5 REST API in `back-end/`, written in TypeScript with ESM. `src/app.ts` mounts the resource routers; the server entry point is `src/bin/server.ts`.
- Resource handling follows `routes -> controllers -> services -> repositories`. Controllers translate HTTP input/output and forward errors; services validate DTOs and enforce business rules; repositories perform Prisma queries. Shared error handling is registered after the routers in `src/app.ts`.
- PostgreSQL access uses Prisma 7 with the `@prisma/adapter-pg` adapter. `prisma/schema.prisma` defines the models and relations; `prisma/migrations/` contains the applied schema history. Keep schema changes and migrations aligned.
- The main domain resources are clients (`Cliente`), administrators (`Administrador`), appointment categories (`CategoriaCompromisso`), and appointments (`Compromisso`). The API is mounted at `/clientes`, `/administradores`, `/categorias-compromisso`, and `/compromissos`.
- `front-end/` is a React + TypeScript application built with Vite. Its public landing page submits leads to the client endpoint; its admin panel uses the appointment, client, category, and administrator endpoints. API requests go through `src/services/api.ts`; data modules provide resource-level calls.
- In local development Vite proxies `/api` to `VITE_BACKEND_URL` (default `http://localhost:8888`) and removes the `/api` prefix. The backend currently validates login credentials but does not issue a session/token or protect the API routes.

## Commands

Run backend commands from `back-end/`:

```bash
npm run dev       # Start the TypeScript server with watch mode
npm run build     # Compile TypeScript into dist/
npm start         # Build, then start the compiled server
npm test          # Run the Vitest unit tests once
npm run test:watch                         # Run Vitest in watch mode
npx vitest run tests/sessionStore.test.ts  # Run a single test file
```

The backend requires `DATABASE_URL`; the server uses `PORT` if set and otherwise listens on `8888`. Unit tests live in `back-end/tests/` and use Vitest; they mock the repository modules with `vi.mock`, so they need no database. The `tests/` folder is excluded from the TypeScript build. There is no backend lint script.

Run front-end commands from `front-end/`:

```bash
npm run dev       # Start Vite; local API proxy is configured in vite.config.ts
npm run build     # Type-check and create the production bundle
npm run lint      # Run Oxlint
```

The front-end has no configured test runner or single-test command.

## Repository conventions

- Preserve the Portuguese domain names used by the API and code. Prisma model properties use camelCase while `@map`/`@@map` map them to the existing snake_case PostgreSQL names; preserve these mappings and the established relation/delete behavior when changing the schema.
- Keep input validation and domain rules in the resource service, not in Prisma repositories. Use the existing DTOs for request shapes and `AppError` for expected API errors; controllers pass caught errors to `next()` for the shared handler.
- For Prisma CLI or Client work, consult the relevant checked-in references under `back-end/.agents/skills/` (notably `prisma-cli` and `prisma-client-api`). Obtain explicit user consent immediately before any data-destructive Prisma operation, such as `migrate reset` or `db push` with reset/data-loss flags.
