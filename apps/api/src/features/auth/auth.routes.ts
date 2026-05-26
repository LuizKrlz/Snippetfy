import {
  loginSchema,
  registerSchema,
} from "@snippetfy/shared";
import { Hono } from "hono";

import { ApiError } from "../../lib/api-error.js";
import { clearAuthCookie, setAuthCookie } from "./auth.cookie.js";
import { requireAuth } from "./auth.middleware.js";
import {
  createToken,
  findUserById,
  login,
  register,
} from "./auth.service.js";
import type { AuthVariables } from "./auth.types.js";

export const authRoutes = new Hono<{ Variables: AuthVariables }>();

authRoutes.post("/auth/register", async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.flatten());
  }

  const user = await register(parsed.data);
  const token = await createToken({ id: user.id, email: user.email });
  setAuthCookie(c, token);

  return c.json({ user }, 201);
});

authRoutes.post("/auth/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.flatten());
  }

  const user = await login(parsed.data);
  const token = await createToken({ id: user.id, email: user.email });
  setAuthCookie(c, token);

  return c.json({ user });
});

authRoutes.post("/auth/logout", (c) => {
  clearAuthCookie(c);
  return c.json({ ok: true as const });
});

authRoutes.get("/auth/me", requireAuth, async (c) => {
  const authUser = c.get("user");
  const user = await findUserById(authUser.id);

  if (!user) {
    throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
  }

  return c.json({ user });
});
