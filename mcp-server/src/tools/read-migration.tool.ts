import { z } from "zod";

import { FilesystemAdapter } from "../adapters/filesystem.adapter.js";

export function registerReadMigrationTool(
  server: any,
  fsAdapter: FilesystemAdapter,
) {
  server.registerTool(
    "read_migration",
    {
      title: "Read Migration",
      description:
        "Lê o conteúdo de uma migration. Ex: database/migrations/20180423160709-create-users.js",
      inputSchema: {
        path: z.string().describe("Path relativo à pasta legacy-app"),
      },
    },
    async ({ path }) => {
      const content = await fsAdapter.readFile(path);

      return {
        content: [{ type: "text", text: content }],
      };
    },
  );
}
