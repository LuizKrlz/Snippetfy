FROM node:22-alpine

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --filter @snippetfy/api...

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN pnpm --filter @snippetfy/shared build \
  && pnpm --filter @snippetfy/api exec prisma generate

WORKDIR /app/apps/api

EXPOSE 4000

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
