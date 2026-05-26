import { LegacyContextService } from "../services/legacy-context.service.js";
import { jsonToolResponse } from "../utils/tool-response.util.js";

export function registerGetDataSchemaTool(
  server: any,
  context: LegacyContextService,
) {
  server.registerTool(
    "get_data_schema",
    {
      title: "Get Data Schema",
      description:
        "Retorna schema do banco (migrations), models Sequelize, relacionamentos e diagrama Mermaid ER",
      inputSchema: {},
    },
    async () => jsonToolResponse(await context.buildDataSchema()),
  );
}
