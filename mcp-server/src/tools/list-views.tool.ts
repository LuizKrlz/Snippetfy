import { FilesystemAdapter } from "../adapters/filesystem.adapter.js";

export function registerListViewsTool(
  server: any,
  fsAdapter: FilesystemAdapter,
) {
  server.registerTool(
    "list_views",
    {
      title: "List Views",
      description: "Lista todos os templates Nunjucks",
      inputSchema: {},
    },
    async () => {
      const files = await fsAdapter.listFilesRecursive("app/views");

      const njkFiles = files.filter((file) => file.endsWith(".njk"));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(njkFiles, null, 2),
          },
        ],
      };
    },
  );
}
