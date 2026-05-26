import type { ApiErrorBody } from "@snippetfy/shared";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorBody,
  ) {
    super(body.error);
    this.name = "ApiClientError";
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({
      error: response.statusText,
    }))) as ApiErrorBody;

    throw new ApiClientError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
