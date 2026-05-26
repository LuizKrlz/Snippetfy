import { z } from "zod";

import { FilesystemAdapter } from "../adapters/filesystem.adapter.js";

export function registerReadViewTool(
  server: any,
  fsAdapter: FilesystemAdapter,
) {
  server.registerTool(
    "read_view",
    {
      title: "Read View",
      description: "Lê qualquer template Nunjucks",
      inputSchema: {
        path: z.string(),
      },
    },
    async ({ path }: { path: string }) => {
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
