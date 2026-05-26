import { LegacyContextService } from "../services/legacy-context.service.js";
import { jsonToolResponse } from "../utils/tool-response.util.js";

export function registerListRoutesTool(
  server: any,
  context: LegacyContextService,
) {
  server.registerTool(
    "list_routes",
    {
      title: "List Routes",
      description:
        "Lista todas as rotas HTTP do legacy-app com método, path, middlewares, handler e feature",
      inputSchema: {},
    },
    async () => jsonToolResponse(await context.getRoutes()),
  );
}
