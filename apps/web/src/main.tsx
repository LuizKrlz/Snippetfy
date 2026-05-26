import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "./providers/AppProviders";
import { queryClient, router } from "./router";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders queryClient={queryClient} router={router} />
  </StrictMode>,
);
