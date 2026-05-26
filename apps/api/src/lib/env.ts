import "./load-env.js";

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  jwtSecret: () => required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  cookieName: process.env.COOKIE_NAME ?? "snippetfy_token",
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
  isProduction: process.env.NODE_ENV === "production",
};

export function parseExpiresInSeconds(value: string): number {
  const match = value.match(/^(\d+)([dhms])$/);

  if (!match) {
    return 7 * 24 * 60 * 60;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "d":
      return amount * 24 * 60 * 60;
    case "h":
      return amount * 60 * 60;
    case "m":
      return amount * 60;
    case "s":
      return amount;
    default:
      return 7 * 24 * 60 * 60;
  }
}
