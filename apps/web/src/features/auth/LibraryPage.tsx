import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

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
    <main className="library-page">
      <header className="library-header">
        <div>
          <h1>My library</h1>
          <p>
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Signing out…" : "Sign out"}
        </button>
      </header>

      <section className="library-placeholder">
        <p>Categories and snippets arrive in Phase 2.</p>
      </section>
    </main>
  );
}
