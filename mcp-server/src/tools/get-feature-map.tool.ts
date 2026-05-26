import { LegacyContextService } from "../services/legacy-context.service.js";
import { jsonToolResponse } from "../utils/tool-response.util.js";

export function registerGetFeatureMapTool(
  server: any,
  context: LegacyContextService,
) {
  server.registerTool(
    "get_feature_map",
    {
      title: "Get Feature Map",
      description:
        "Mapeia o sistema por feature (auth, dashboard, categories, snippets, shared) com rotas, controllers, views, models e migrations",
      inputSchema: {},
    },
    async () => jsonToolResponse(await context.buildFeatureMap()),
  );
}
