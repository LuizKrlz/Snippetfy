import { LegacyContextService } from "../services/legacy-context.service.js";
import { jsonToolResponse } from "../utils/tool-response.util.js";

export function registerListMigrationsTool(
  server: any,
  context: LegacyContextService,
) {
  server.registerTool(
    "list_migrations",
    {
      title: "List Migrations",
      description: "Lista migrations Sequelize parseadas com tabelas e colunas",
      inputSchema: {},
    },
    async () => jsonToolResponse(await context.getMigrations()),
  );
}
