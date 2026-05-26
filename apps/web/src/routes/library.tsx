import { createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "../features/auth/auth-guard.js";
import { LibraryPage } from "../features/auth/LibraryPage.js";

export const Route = createFileRoute("/library")({
  beforeLoad: async ({ context }) => {
    await requireAuth(context.queryClient);
  },
  component: LibraryPage,
});
