import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { FilesystemAdapter } from "./adapters/filesystem.adapter.js";
import { LegacyContextService } from "./services/legacy-context.service.js";
import { registerExtractApiContractTool } from "./tools/extract-api-contract.tool.js";
import { registerGetDataSchemaTool } from "./tools/get-data-schema.tool.js";
import { registerGetFeatureMapTool } from "./tools/get-feature-map.tool.js";
import { registerListFormsTool } from "./tools/list-forms.tool.js";
import { registerListMigrationsTool } from "./tools/list-migrations.tool.js";
import { registerListModelsTool } from "./tools/list-models.tool.js";
import { registerListRoutesTool } from "./tools/list-routes.tool.js";
import { registerListViewsTool } from "./tools/list-views.tool.js";
import { registerReadControllerTool } from "./tools/read-controller.tool.js";
import { registerReadMigrationTool } from "./tools/read-migration.tool.js";
import { registerReadModelTool } from "./tools/read-model.tool.js";
import { registerReadViewTool } from "./tools/read-view.tool.js";
import { registerSearchTextTool } from "./tools/search-text.tool.js";
import { registerTraceRequestFlowTool } from "./tools/trace-request-flow.tool.js";
import { LEGACY_ROOT } from "./utils/path.util.js";

async function bootstrap() {
  const server = new McpServer({
    name: "legacy-node-system",
    version: "2.0.0",
  });

  const fsAdapter = new FilesystemAdapter(LEGACY_ROOT);
  const context = new LegacyContextService(fsAdapter);

  registerListViewsTool(server, fsAdapter);
  registerReadViewTool(server, fsAdapter);
  registerReadControllerTool(server, fsAdapter);
  registerSearchTextTool(server, fsAdapter);

  registerListRoutesTool(server, context);
  registerGetFeatureMapTool(server, context);
  registerTraceRequestFlowTool(server, context);
  registerGetDataSchemaTool(server, context);
  registerExtractApiContractTool(server, context);
  registerListModelsTool(server, context);
  registerReadModelTool(server, fsAdapter);
  registerListMigrationsTool(server, context);
  registerReadMigrationTool(server, fsAdapter);
  registerListFormsTool(server, context);

  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("MCP Server running (v2.0.0)...");
}

bootstrap();
