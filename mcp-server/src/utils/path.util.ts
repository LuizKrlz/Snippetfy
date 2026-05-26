import path from "node:path";

export const LEGACY_ROOT = path.resolve(process.cwd(), "../legacy-app");

export const LEGACY_APP = path.join(LEGACY_ROOT, "app");

/** Normalizes paths relative to legacy-app (e.g. views/foo → app/views/foo). */
export function normalizeLegacyPath(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\//, "");

  if (
    normalized.startsWith("app/") ||
    normalized.startsWith("database/") ||
    normalized.startsWith("config/")
  ) {
    return normalized;
  }

  const appPrefixes = [
    "views/",
    "controllers/",
    "models/",
    "middlewares/",
    "public/",
    "routes.js",
  ];

  if (appPrefixes.some((prefix) => normalized.startsWith(prefix))) {
    return `app/${normalized}`;
  }

  return normalized;
}
