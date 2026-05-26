import type { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";

import { ApiError } from "../../lib/api-error.js";
import { env } from "../../lib/env.js";
import { getAuthToken } from "./auth.cookie.js";
import type { AuthVariables, JwtPayload } from "./auth.types.js";

export const requireAuth: MiddlewareHandler<{
  Variables: AuthVariables;
}> = async (c, next) => {
  const token = getAuthToken(c);

  if (!token) {
    throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
  }

  try {
    const payload = (await verify(
      token,
      env.jwtSecret(),
      "HS256",
    )) as JwtPayload;

    c.set("user", {
      id: payload.sub,
      email: payload.email,
    });

    await next();
  } catch {
    throw new ApiError(401, "Invalid or expired session", "UNAUTHORIZED");
  }
};
