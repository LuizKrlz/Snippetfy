import { LegacyContextService } from "../services/legacy-context.service.js";
import { jsonToolResponse } from "../utils/tool-response.util.js";

export function registerListModelsTool(
  server: any,
  context: LegacyContextService,
) {
  server.registerTool(
    "list_models",
    {
      title: "List Models",
      description:
        "Lista models Sequelize com atributos, associações e getter methods",
      inputSchema: {},
    },
    async () => jsonToolResponse(await context.getModels()),
  );
}
