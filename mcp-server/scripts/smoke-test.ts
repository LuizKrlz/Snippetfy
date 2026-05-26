import { FilesystemAdapter } from "../src/adapters/filesystem.adapter.js";
import { LegacyContextService } from "../src/services/legacy-context.service.js";
import { LEGACY_ROOT } from "../src/utils/path.util.js";

async function main() {
  const fs = new FilesystemAdapter(LEGACY_ROOT);
  const ctx = new LegacyContextService(fs);

  const routes = await ctx.getRoutes();
  console.log("routes:", routes.length);

  const featureMap = await ctx.buildFeatureMap();
  console.log(
    "features:",
    featureMap.map((f) => `${f.feature} (${f.routes.length} routes)`).join(", "),
  );

  const flow = await ctx.traceRequestFlow(
    "GET",
    "/app/categories/1/snippets/2",
  );
  console.log("trace handler:", flow.route?.handler);

  const schema = await ctx.buildDataSchema();
  console.log("tables:", schema.tables.map((t) => t.tableName).join(", "));

  const contracts = await ctx.extractApiContracts();
  console.log("api contracts:", contracts.length);
}

main().catch(console.error);
