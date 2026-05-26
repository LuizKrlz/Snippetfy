import type {
  AuthSuccessResponse,
  LoginInput,
  LogoutResponse,
  RegisterInput,
} from "@snippetfy/shared";

import { apiFetch } from "../../lib/api-client.js";

export function register(input: RegisterInput) {
  return apiFetch<AuthSuccessResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: LoginInput) {
  return apiFetch<AuthSuccessResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return apiFetch<LogoutResponse>("/auth/logout", {
    method: "POST",
  });
}

export function getMe() {
  return apiFetch<AuthSuccessResponse>("/auth/me");
}
