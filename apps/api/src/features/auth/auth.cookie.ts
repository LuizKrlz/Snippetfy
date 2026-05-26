import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { env } from "../../lib/env.js";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function setAuthCookie(c: Context, token: string) {
  setCookie(c, env.cookieName, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "Lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearAuthCookie(c: Context) {
  deleteCookie(c, env.cookieName, {
    path: "/",
  });
}

export function getAuthToken(c: Context): string | undefined {
  return getCookie(c, env.cookieName);
}
