import { Hono } from "hono";
import { cors } from "hono/cors";

import { authRoutes } from "./features/auth/auth.routes.js";
import { categoriesRoutes } from "./features/categories/categories.routes.js";
import { healthRoutes } from "./features/health/health.routes.js";
import { ApiError } from "./lib/api-error.js";
import { env } from "./lib/env.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: env.webOrigin,
    credentials: true,
  }),
);

app.route("/", healthRoutes);
app.route("/", authRoutes);
app.route("/", categoriesRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(err.toJSON(), err.status as 400 | 401 | 404 | 409 | 500);
  }

  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export { app };
