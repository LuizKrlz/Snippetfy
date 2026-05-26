import { Hono } from "hono";

import { prisma } from "../../lib/prisma.js";

const APP_VERSION = "2.0.0";

export const healthRoutes = new Hono();

healthRoutes.get("/health", (c) =>
  c.json({
    status: "ok",
    version: APP_VERSION,
    service: "snippetfy-api",
  }),
);

healthRoutes.get("/health/db", async (c) => {
  await prisma.$queryRaw`SELECT 1`;

  return c.json({
    status: "ok",
    version: APP_VERSION,
    database: "connected",
  });
});
