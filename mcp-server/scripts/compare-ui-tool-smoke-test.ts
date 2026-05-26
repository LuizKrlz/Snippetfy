import { FilesystemAdapter } from "../src/adapters/filesystem.adapter.js";
import { LegacyContextService } from "../src/services/legacy-context.service.js";
import { UiMappingService } from "../src/services/ui-mapping.service.js";
import { registerCompareUiTargetsTool } from "../src/tools/compare-ui-targets.tool.js";
import { LEGACY_ROOT } from "../src/utils/path.util.js";

async function main() {
  const fs = new FilesystemAdapter(LEGACY_ROOT);
  const context = new LegacyContextService(fs);
  const uiMapping = new UiMappingService(context, fs);

  let handler:
    | ((input: {
        feature?: "auth" | "dashboard" | "categories" | "snippets" | "shared";
        groupBy?: "view" | "component-type" | "feature";
      }) => Promise<{ content: { type: string; text: string }[] }>)
    | undefined;

  const server = {
    registerTool(
      _name: string,
      _meta: unknown,
      fn: (input: {
        feature?: "auth" | "dashboard" | "categories" | "snippets" | "shared";
        groupBy?: "view" | "component-type" | "feature";
      }) => Promise<{ content: { type: string; text: string }[] }>,
    ) {
      handler = fn;
    },
  };

  registerCompareUiTargetsTool(server, uiMapping);

  if (!handler) {
    throw new Error("compare_ui_targets handler was not registered");
  }

  const categories = await handler({ feature: "categories" });
  const snippets = await handler({ feature: "snippets", groupBy: "view" });

  console.log(
    "compare categories contains heroui:",
    categories.content[0]?.text.includes("\"heroui\""),
  );
  console.log(
    "compare categories contains shadcn:",
    categories.content[0]?.text.includes("\"shadcn\""),
  );
  console.log(
    "compare snippets contains recommendedTarget:",
    snippets.content[0]?.text.includes("recommendedTarget"),
  );
}

main().catch(console.error);
