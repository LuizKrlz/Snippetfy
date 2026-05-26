import type { ApiDbHealth, ApiHealth } from "@snippetfy/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API ${path} failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getApiUrl() {
  return API_URL;
}

export function fetchHealth() {
  return fetchJson<ApiHealth>("/health");
}

export function fetchDbHealth() {
  return fetchJson<ApiDbHealth>("/health/db");
}
