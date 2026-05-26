import "./lib/load-env.js";

import { serve } from "@hono/node-server";

import { app } from "./app.js";

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`snippetfy-api listening on http://localhost:${info.port}`);
  },
);
