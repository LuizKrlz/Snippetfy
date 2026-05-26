import { createFileRoute, redirect } from "@tanstack/react-router";

import { isUnauthorized, meQueryOptions } from "../features/auth/queries.js";

export const Route = createFileRoute("/")({
  component: () => null,
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(meQueryOptions);
      throw redirect({ to: "/library" });
    } catch (error) {
      if (isUnauthorized(error)) {
        throw redirect({ to: "/login" });
      }
      throw error;
    }
  },
});
