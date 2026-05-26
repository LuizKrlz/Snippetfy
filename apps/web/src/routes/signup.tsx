import { createFileRoute } from "@tanstack/react-router";

import { redirectIfAuthenticated } from "../features/auth/auth-guard.js";
import { SignupForm } from "../features/auth/SignupForm.js";

export const Route = createFileRoute("/signup")({
  beforeLoad: async ({ context }) => {
    await redirectIfAuthenticated(context.queryClient);
  },
  component: SignupForm,
});
