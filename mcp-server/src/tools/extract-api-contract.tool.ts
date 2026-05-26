import { z } from "zod";

import { LegacyContextService } from "../services/legacy-context.service.js";
import { jsonToolResponse } from "../utils/tool-response.util.js";

export function registerExtractApiContractTool(
  server: any,
  context: LegacyContextService,
) {
  server.registerTool(
    "extract_api_contract",
    {
      title: "Extract API Contract",
      description:
        "Extrai contratos das rotas mutantes (POST/PUT/DELETE): body fields, validações, flash, redirects e forms vinculados",
      inputSchema: {
        feature: z
          .string()
          .optional()
          .describe(
            "Filtrar por feature: auth, categories, snippets, dashboard, shared",
          ),
      },
    },
    async ({ feature }: { feature?: string }) => {
      const contracts = await context.extractApiContracts();

      if (feature) {
        return jsonToolResponse(
          contracts.filter((c) => c.feature === feature),
        );
      }

      return jsonToolResponse(contracts);
    },
  );
}
