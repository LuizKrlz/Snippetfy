import { createFileRoute } from "@tanstack/react-router";

import { redirectIfAuthenticated } from "../features/auth/auth-guard.js";
import { LoginForm } from "../features/auth/LoginForm.js";

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect:
      typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: async ({ context }) => {
    await redirectIfAuthenticated(context.queryClient);
  },
  component: LoginForm,
});
