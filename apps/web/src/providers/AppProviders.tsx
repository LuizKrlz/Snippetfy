import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";

import { AppToastRegion } from "../components/ui";
import { uiTheme } from "../lib/ui-theme";
import type { router } from "../router";

interface AppProvidersProps {
  queryClient: QueryClient;
  router: typeof router;
}

export function AppProviders({ queryClient, router }: AppProvidersProps) {
  return (
    <div className={uiTheme.layout.app}>
      <QueryClientProvider client={queryClient}>
        <AppToastRegion />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </div>
  );
}
