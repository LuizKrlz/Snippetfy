import { z } from "zod";

import { UiMappingService } from "../services/ui-mapping.service.js";
import { jsonToolResponse } from "../utils/tool-response.util.js";

const featureSchema = z
  .enum(["auth", "dashboard", "categories", "snippets", "shared"])
  .optional();

const groupBySchema = z
  .enum(["view", "component-type", "feature"])
  .optional();

export function registerCompareUiTargetsTool(
  server: any,
  uiMapping: UiMappingService,
) {
  server.registerTool(
    "compare_ui_targets",
    {
      title: "Compare UI Targets",
      description:
        "Compara sugestões HeroUI e shadcn/ui para os padrões de interface detectados no legacy-app",
      inputSchema: {
        feature: featureSchema.describe(
          "Filtrar por feature: auth, dashboard, categories, snippets, shared",
        ),
        groupBy: groupBySchema.describe(
          "Agrupar comparação por tipo de componente, view ou feature. Padrão: component-type",
        ),
      },
    },
    async ({
      feature,
      groupBy,
    }: {
      feature?: "auth" | "dashboard" | "categories" | "snippets" | "shared";
      groupBy?: "view" | "component-type" | "feature";
    }) =>
      jsonToolResponse(
        await uiMapping.compareUiTargets({
          feature,
          groupBy,
        }),
      ),
  );
}
