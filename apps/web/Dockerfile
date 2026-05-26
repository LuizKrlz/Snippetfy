FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --filter @snippetfy/web...

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN pnpm --filter @snippetfy/shared build

WORKDIR /app/apps/web

EXPOSE 5173

CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]
