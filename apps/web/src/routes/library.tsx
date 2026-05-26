import { createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "../features/auth/auth-guard.js";
import { LibraryPage } from "../features/categories/LibraryPage.js";

type LibrarySearch = {
  categoryId?: number;
};

export const Route = createFileRoute("/library")({
  validateSearch: (search: Record<string, unknown>): LibrarySearch => ({
    categoryId:
      typeof search.categoryId === "string" && /^\d+$/.test(search.categoryId)
        ? Number(search.categoryId)
        : typeof search.categoryId === "number" &&
            Number.isInteger(search.categoryId) &&
            search.categoryId > 0
          ? search.categoryId
          : undefined,
  }),
  beforeLoad: async ({ context }) => {
    await requireAuth(context.queryClient);
  },
  component: LibraryPage,
});
