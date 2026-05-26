import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";

import { isUnauthorized, meQueryOptions } from "./queries.js";

export async function requireAuth(queryClient: QueryClient) {
  try {
    const data = await queryClient.ensureQueryData(meQueryOptions);
    return data.user;
  } catch (error) {
    if (isUnauthorized(error)) {
      throw redirect({ to: "/login" });
    }
    throw error;
  }
}

export async function redirectIfAuthenticated(queryClient: QueryClient) {
  try {
    await queryClient.fetchQuery(meQueryOptions);
    throw redirect({ to: "/library" });
  } catch (error) {
    if (isUnauthorized(error)) {
      return;
    }
    throw error;
  }
}
