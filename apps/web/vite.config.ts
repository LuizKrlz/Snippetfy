import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  envDir: "../../",
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  preview: {
    host: true,
    port: 5173,
  },
});
