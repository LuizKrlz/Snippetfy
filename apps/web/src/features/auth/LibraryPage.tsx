import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { AppBadge, AppButton, PageShell, SectionCard } from "../../components/ui";
import { logout } from "./api.js";
import { authKeys, meQueryOptions } from "./queries.js";

export function LibraryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery(meQueryOptions);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: authKeys.me });
      await navigate({ to: "/login" });
    },
  });

  const user = data?.user;

  return (
    <PageShell size="lg">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
              My library
            </h1>
            <AppBadge>Phase 1</AppBadge>
          </div>
          <p className="text-slate-400">
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>
        <AppButton
          intent="ghost"
          isLoading={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
          type="button"
        >
          {logoutMutation.isPending ? "Signing out…" : "Sign out"}
        </AppButton>
      </header>

      <SectionCard
        description="The new UI foundation is ready for categories, sidebar navigation, badges, modals, and snippet workflows."
        title="Library workspace"
      >
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-6 py-10 text-center text-slate-400">
          <p>Categories and snippets arrive in Phase 2.</p>
        </div>
      </SectionCard>
    </PageShell>
  );
}
