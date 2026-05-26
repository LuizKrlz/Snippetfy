import { z } from "zod";

import { LegacyContextService } from "../services/legacy-context.service.js";
import { jsonToolResponse } from "../utils/tool-response.util.js";

export function registerTraceRequestFlowTool(
  server: any,
  context: LegacyContextService,
) {
  server.registerTool(
    "trace_request_flow",
    {
      title: "Trace Request Flow",
      description:
        "Rastreia o fluxo completo de uma rota: middlewares → controller → queries → views → partials → forms",
      inputSchema: {
        method: z
          .string()
          .describe("Método HTTP, ex: GET, POST, PUT, DELETE"),
        path: z
          .string()
          .describe("Path da requisição, ex: /app/categories/1/snippets/2"),
      },
    },
    async ({ method, path }) =>
      jsonToolResponse(await context.traceRequestFlow(method, path)),
  );
}
