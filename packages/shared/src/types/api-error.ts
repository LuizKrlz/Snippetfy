export const AUTH_ERROR_CODES = [
  "VALIDATION_ERROR",
  "EMAIL_TAKEN",
  "INVALID_CREDENTIALS",
  "UNAUTHORIZED",
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

export type ApiErrorBody = {
  error: string;
  code?: AuthErrorCode;
  details?: unknown;
};

export type AuthSuccessResponse = {
  user: {
    id: number;
    name: string | null;
    email: string;
  };
};

export type LogoutResponse = {
  ok: true;
};
