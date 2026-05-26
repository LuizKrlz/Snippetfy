import { z } from "zod";

import { UiMappingService } from "../services/ui-mapping.service.js";
import { jsonToolResponse } from "../utils/tool-response.util.js";

const featureSchema = z
  .enum(["auth", "dashboard", "categories", "snippets", "shared"])
  .optional();

const groupBySchema = z
  .enum(["view", "component-type", "feature"])
  .optional();

export function registerMapUiComponentsTool(
  server: any,
  uiMapping: UiMappingService,
) {
  server.registerTool(
    "map_ui_components",
    {
      title: "Map UI Components",
      description:
        "Inventaria padrões de UI do legacy-app e sugere equivalentes HeroUI para apoiar a migração futura",
      inputSchema: {
        feature: featureSchema.describe(
          "Filtrar por feature: auth, dashboard, categories, snippets, shared",
        ),
        includeSuggestions: z
          .boolean()
          .optional()
          .describe("Incluir sugestões HeroUI na resposta. Padrão: true"),
        groupBy: groupBySchema.describe(
          "Agrupar inventário por tipo de componente, view ou feature. Padrão: component-type",
        ),
      },
    },
    async ({
      feature,
      includeSuggestions,
      groupBy,
    }: {
      feature?: "auth" | "dashboard" | "categories" | "snippets" | "shared";
      includeSuggestions?: boolean;
      groupBy?: "view" | "component-type" | "feature";
    }) =>
      jsonToolResponse(
        await uiMapping.mapUiComponents({
          feature,
          includeSuggestions,
          groupBy,
        }),
      ),
  );
}
