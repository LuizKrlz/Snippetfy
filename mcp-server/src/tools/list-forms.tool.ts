import { z } from "zod";

import { LegacyContextService } from "../services/legacy-context.service.js";
import { jsonToolResponse } from "../utils/tool-response.util.js";

export function registerListFormsTool(
  server: any,
  context: LegacyContextService,
) {
  server.registerTool(
    "list_forms",
    {
      title: "List Forms",
      description:
        "Lista todos os formulários HTML nas views Nunjucks com action, method e campos",
      inputSchema: {
        feature: z
          .string()
          .optional()
          .describe("Filtrar por pasta da feature: auth, categories, snippets"),
      },
    },
    async ({ feature }) => {
      const forms = await context.getAllForms();

      if (!feature) {
        return jsonToolResponse(forms);
      }

      return jsonToolResponse(
        forms.filter((form) => form.sourceFile.includes(`/${feature}/`)),
      );
    },
  );
}
