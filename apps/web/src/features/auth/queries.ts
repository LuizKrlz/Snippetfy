import { queryOptions } from "@tanstack/react-query";

import { ApiClientError } from "../../lib/api-client.js";
import { getMe } from "./api.js";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export const meQueryOptions = queryOptions({
  queryKey: authKeys.me,
  queryFn: getMe,
  retry: false,
  staleTime: 60_000,
});

export function isUnauthorized(error: unknown) {
  return error instanceof ApiClientError && error.status === 401;
}
