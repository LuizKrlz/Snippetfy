import { z } from "zod";

import { FilesystemAdapter } from "../adapters/filesystem.adapter.js";

export function registerReadControllerTool(
  server: any,
  fsAdapter: FilesystemAdapter,
) {
  server.registerTool(
    "read_controller",
    {
      title: "Read Controller",
      description: "Lê controller do sistema",
      inputSchema: {
        path: z.string(),
      },
    },
    async ({ path }) => {
      const content = await fsAdapter.readFile(path);

      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    },
  );
}
