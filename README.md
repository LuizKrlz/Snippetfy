# Snippetfy v2

V1 are in **master** branch

This repository evolved through phases to reach a single modern stack (SPA + API), based on **PostgreSQL**.

## How it was (before Phase 4)
Before **Phase 4**, the repository kept two stacks in parallel:
- The new stack (SPA + API), running with **Vite + React** and **Hono API + Prisma**.
- The legacy stack in `legacy-app/`, with **MySQL** and a separate UI/API flow (including its own routes, views, and logic).

Additionally, there was a `mcp-server` focused specifically on analyzing the `legacy-app/` stack.
We created this `mcp-server` to improve AI context during the migration. It provided MCP tools that helped extract and summarize legacy behavior (routes/controllers, models, views/migrations, and UI-component mappings), so the new stack could be implemented with functional parity and fewer guesswork.

## What changed in Phase 4
In **Phase 4**, we retired the legacy to keep the project simpler and fully focused on the new stack:
- `legacy-app/` was removed (the legacy MySQL stack).
- `mcp-server/` was removed (the MCP that was used for legacy analysis).
- Configuration and documentation now reference only the new stack (Web + API + PostgreSQL).

## How it is now (after Phase 4)
The repository now contains only the new stack:
- `apps/web`: Frontend **Vite + React (SPA)**
- `apps/api`: Backend **Hono + Prisma** (CRUD/validation + authentication)
- `packages/shared`: **Zod schemas/contracts** shared between web and api

The environment runs with `docker compose` using only `db`, `api`, and `web` (no MySQL/legacy).

### How the stack runs today (Docker)
- `db`: PostgreSQL `16-alpine`, exposed at `localhost:5433` (container `5432`). It has a healthcheck so `api` starts only once the database is ready.
- `api` (Hono): runs at `localhost:4000`, using `DATABASE_URL` to point to the `db` service. It also uses `JWT_SECRET`, `JWT_EXPIRES_IN`, and `COOKIE_NAME` (cookie-based auth) plus `WEB_ORIGIN` (CORS with `credentials` enabled).
- `web` (Vite): runs at `localhost:5173` and uses `VITE_API_URL=http://localhost:4000` to call the API.

For development, `docker-compose.yml` bind-mounts `apps/api/src` and `apps/web/src` (and also `packages/shared/src`) to reload changes without a full rebuild.

| Service    | Local URL      |
|------------|-----------------|
| Web (Vite) | http://localhost:5173 |
| API (Hono) | http://localhost:4000 |
| PostgreSQL | localhost:**5433**     |

## Run the project

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- (Optional outside Docker) Node 20+ and [pnpm](https://pnpm.io)

### With Docker (recommended)
```bash
# From the repository root
cp .env.example .env
docker compose up --build
```

Open http://localhost:5173.

Seed a dev user (optional):
```bash
pnpm db:seed
# testeuser@mail.com / 123456
```

Stop:
```bash
docker compose down
```

### Local development (without Docker for api/web)
```bash
pnpm install
cp .env.example .env

# Postgres on 5433 (or adjust DATABASE_URL in .env)
docker compose up db -d

pnpm --filter @snippetfy/shared build
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Environment variables
Use a **single** `.env` file at the **repository root**.
- Docker Compose uses this `.env` to configure `db` and `api`.
- The `pnpm db:*` scripts also load variables from this `.env`.
- Prisma runs inside `apps/api/`, but reads the root env file via `dotenv-cli`.

## Monorepo structure
```
apps/
  api/          Hono + Prisma + PostgreSQL
  web/          Vite + React (SPA)
packages/
  shared/       Shared Zod schemas and types
```

## Phase cycle
- [x] **Phase 0** — Monorepo, Prisma, isolated Docker, health checks
- [x] **Phase 1** — Authentication (JWT + cookie) and routing in the SPA (TanStack Router)
- [x] **Phase 2** — Categories (API + list/selection in `/library`)
- [x] **Phase 3** — Snippets (CRUD per category + markdown details)
- [x] **Phase 4** — Retire legacy (remove `legacy-app/` and the legacy MCP)

## Useful scripts
```bash
pnpm docker:up       # compose up --build
pnpm docker:down
pnpm db:migrate      # prisma migrate deploy
pnpm db:migrate:dev  # create migration in dev mode
pnpm db:seed         # seed (testeuser@mail.com / 123456)
pnpm db:studio       # Prisma Studio
```
