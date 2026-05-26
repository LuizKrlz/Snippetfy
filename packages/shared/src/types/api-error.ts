export const AUTH_ERROR_CODES = [
  "VALIDATION_ERROR",
  "EMAIL_TAKEN",
  "INVALID_CREDENTIALS",
  "UNAUTHORIZED",
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];
export const APP_ERROR_CODES = [...AUTH_ERROR_CODES, "NOT_FOUND"] as const;
export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

export type ApiErrorBody = {
  error: string;
  code?: AppErrorCode;
  details?: unknown;
};

export type OkResponse = {
  ok: true;
};

export type AuthSuccessResponse = {
  user: {
    id: number;
    name: string | null;
    email: string;
  };
};

export type LogoutResponse = OkResponse;
