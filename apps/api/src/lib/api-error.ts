import type { ApiErrorBody, AuthErrorCode } from "@snippetfy/shared";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: AuthErrorCode,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  toJSON(): ApiErrorBody {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
    };
  }
}
