# Snippetfy v2

The new Snippetfy stack (SPA + API), **separate** from the legacy app in [`legacy-app/`](legacy-app/).

| Service    | Local URL              |
|------------|------------------------|
| Web (Vite) | http://localhost:5173  |
| API (Hono) | http://localhost:4000  |
| PostgreSQL | localhost:**5433**     |

The legacy app remains in `legacy-app/` with MySQL on port 3306 — no port conflicts.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- (Optional) Node 20+ and [pnpm](https://pnpm.io) for development outside Docker

## Run with Docker (recommended)

```bash
# From the repository root
cp .env.example .env
docker compose up --build
```

Open http://localhost:5173. Seed a dev user (optional):

```bash
pnpm db:seed
# testeuser@mail.com / 123456
```

Stop:

```bash
docker compose down
```

## Environment

Keep a single `.env` at the **repository root** (used by Docker Compose and `pnpm db:*` scripts). Prisma runs inside `apps/api/` but loads variables from the root file via `dotenv-cli`.

## Local development (without Docker)

```bash
pnpm install
cp .env.example .env

# Postgres on port 5433 (or adjust DATABASE_URL in .env)
docker compose up db -d

pnpm --filter @snippetfy/shared build
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Monorepo structure

```
apps/
  api/          Hono + Prisma + PostgreSQL
  web/          Vite + React (SPA)
packages/
  shared/       Shared Zod schemas and types
legacy-app/     Old stack (not used by the root compose file)
mcp-server/     MCP for legacy codebase analysis
```

## Migration phases

- [x] **Phase 0** — Monorepo, Prisma, isolated Docker, health checks
- [x] **Phase 1** — Authentication (JWT + TanStack Router)
- [x] **Phase 2** — Categories
- [x] **Phase 3** — Snippets
- [ ] **Phase 4** — Retire legacy

## Useful scripts

```bash
pnpm docker:up       # compose up --build
pnpm docker:down
pnpm db:migrate      # prisma migrate deploy
pnpm db:migrate:dev  # create migration in dev
pnpm db:seed         # dev user (testeuser@mail.com / 123456)
pnpm db:studio       # Prisma Studio
```
