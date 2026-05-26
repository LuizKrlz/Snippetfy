import { z } from "zod";

import { FilesystemAdapter } from "../adapters/filesystem.adapter.js";
import { jsonToolResponse } from "../utils/tool-response.util.js";

export function registerSearchTextTool(
  server: any,
  fsAdapter: FilesystemAdapter,
) {
  server.registerTool(
    "search_text",
    {
      title: "Search Text",
      description:
        "Busca texto recursivamente no legacy-app. Pasta padrão: app. Use database ou config para migrations/configs",
      inputSchema: {
        text: z.string().describe("Texto a buscar"),
        folder: z
          .string()
          .optional()
          .describe("Pasta relativa a legacy-app. Padrão: app"),
      },
    },
    async ({ text, folder }: { text: string; folder?: string }) => {
      const targetFolder = folder ?? "app";
      const matches = await fsAdapter.searchTextRecursive(targetFolder, text);

      return jsonToolResponse(matches);
    },
  );
}
