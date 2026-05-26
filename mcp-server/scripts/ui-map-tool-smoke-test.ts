import { FilesystemAdapter } from "../src/adapters/filesystem.adapter.js";
import { LegacyContextService } from "../src/services/legacy-context.service.js";
import { UiMappingService } from "../src/services/ui-mapping.service.js";
import { registerMapUiComponentsTool } from "../src/tools/map-ui-components.tool.js";
import { LEGACY_ROOT } from "../src/utils/path.util.js";

async function main() {
  const fs = new FilesystemAdapter(LEGACY_ROOT);
  const context = new LegacyContextService(fs);
  const uiMapping = new UiMappingService(context, fs);

  let handler:
    | ((input: {
        feature?: "auth" | "dashboard" | "categories" | "snippets" | "shared";
        includeSuggestions?: boolean;
        groupBy?: "view" | "component-type" | "feature";
      }) => Promise<{ content: { type: string; text: string }[] }>)
    | undefined;

  const server = {
    registerTool(
      _name: string,
      _meta: unknown,
      fn: (input: {
        feature?: "auth" | "dashboard" | "categories" | "snippets" | "shared";
        includeSuggestions?: boolean;
        groupBy?: "view" | "component-type" | "feature";
      }) => Promise<{ content: { type: string; text: string }[] }>,
    ) {
      handler = fn;
    },
  };

  registerMapUiComponentsTool(server, uiMapping);

  if (!handler) {
    throw new Error("map_ui_components handler was not registered");
  }

  const auth = await handler({ feature: "auth" });
  const categories = await handler({ feature: "categories" });
  const snippets = await handler({ feature: "snippets", groupBy: "view" });

  console.log("tool auth contains auth-form:", auth.content[0]?.text.includes("auth-form"));
  console.log(
    "tool categories contains sidebar-nav:",
    categories.content[0]?.text.includes("sidebar-nav"),
  );
  console.log(
    "tool snippets contains markdown-editor:",
    snippets.content[0]?.text.includes("markdown-editor"),
  );
}

main().catch(console.error);
