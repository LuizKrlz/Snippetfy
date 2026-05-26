import { z } from "zod";

import { FilesystemAdapter } from "../adapters/filesystem.adapter.js";
import { jsonToolResponse } from "../utils/tool-response.util.js";

export function registerReadModelTool(
  server: any,
  fsAdapter: FilesystemAdapter,
) {
  server.registerTool(
    "read_model",
    {
      title: "Read Model",
      description:
        "Lê o conteúdo de um model Sequelize. Ex: User, Category ou app/models/user.js",
      inputSchema: {
        name: z
          .string()
          .describe("Nome do model (User) ou path (app/models/user.js)"),
      },
    },
    async ({ name }: { name: string }) => {
      const path = name.endsWith(".js")
        ? name
        : `app/models/${name.charAt(0).toLowerCase()}${name.slice(1)}.js`;

      const content = await fsAdapter.readFile(path);

      return {
        content: [{ type: "text", text: content }],
      };
    },
  );
}
