import { FilesystemAdapter } from "../src/adapters/filesystem.adapter.js";
import { LegacyContextService } from "../src/services/legacy-context.service.js";
import { UiMappingService } from "../src/services/ui-mapping.service.js";
import { LEGACY_ROOT } from "../src/utils/path.util.js";

async function main() {
  const fs = new FilesystemAdapter(LEGACY_ROOT);
  const context = new LegacyContextService(fs);
  const uiMapping = new UiMappingService(context, fs);

  const auth = await uiMapping.mapUiComponents({ feature: "auth" });
  const categories = await uiMapping.mapUiComponents({ feature: "categories" });
  const snippets = await uiMapping.mapUiComponents({ feature: "snippets" });

  console.log(
    "auth types:",
    auth.occurrences.map((item) => item.type).join(", "),
  );
  console.log(
    "categories types:",
    categories.occurrences.map((item) => item.type).join(", "),
  );
  console.log(
    "snippets types:",
    snippets.occurrences.map((item) => item.type).join(", "),
  );
}

main().catch(console.error);
