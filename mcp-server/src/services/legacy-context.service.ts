import { FilesystemAdapter } from "../adapters/filesystem.adapter.js";
import { parseControllerMethod } from "../parsers/controller.parser.js";
import { parseMigrationFile } from "../parsers/migration.parser.js";
import { parseModelFile } from "../parsers/model.parser.js";
import { parseRoutesFile, type ParsedRoute } from "../parsers/routes.parser.js";
import {
  parseFormsInView,
  parseViewExtends,
  parseViewIncludes,
  resolveViewPath,
  type ParsedForm,
} from "../parsers/view.parser.js";

export class LegacyContextService {
  private routesCache: ParsedRoute[] | null = null;

  constructor(private readonly fs: FilesystemAdapter) {}

  async getRoutes(): Promise<ParsedRoute[]> {
    if (!this.routesCache) {
      const content = await this.fs.readFile("app/routes.js");
      this.routesCache = parseRoutesFile(content);
    }

    return this.routesCache;
  }

  async getModels() {
    const files = await this.fs.listFilesRecursive("app/models");
    const modelFiles = files.filter(
      (f) => f.endsWith(".js") && !f.endsWith("index.js"),
    );

    const models = [];

    for (const file of modelFiles) {
      const content = await this.fs.readFile(file);
      models.push(parseModelFile(content, file));
    }

    return models;
  }

  async getMigrations() {
    const files = await this.fs.listFilesRecursive("database/migrations");
    const migrations = [];

    for (const file of files.filter((f) => f.endsWith(".js"))) {
      const content = await this.fs.readFile(file);
      const schema = parseMigrationFile(content, file);

      if (schema) {
        migrations.push(schema);
      }
    }

    return migrations.sort((a, b) => a.file.localeCompare(b.file));
  }

  async getAllForms(): Promise<ParsedForm[]> {
    const viewFiles = (await this.fs.listFilesRecursive("app/views")).filter(
      (f) => f.endsWith(".njk"),
    );

    const forms: ParsedForm[] = [];

    for (const file of viewFiles) {
      const content = await this.fs.readFile(file);
      forms.push(...parseFormsInView(content, file));
    }

    return forms;
  }

  async expandViewTree(viewName: string) {
    const visited = new Set<string>();
    const tree: {
      view: string;
      path: string;
      extends: string | null;
      includes: string[];
      forms: ParsedForm[];
    }[] = [];

    const queue = [viewName];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (visited.has(current)) {
        continue;
      }

      visited.add(current);

      const viewPath = resolveViewPath(current);
      const content = await this.fs.readFile(viewPath);
      const includes = parseViewIncludes(content);
      const extendsLayout = parseViewExtends(content);

      tree.push({
        view: current,
        path: viewPath,
        extends: extendsLayout,
        includes,
        forms: parseFormsInView(content, viewPath),
      });

      for (const include of includes) {
        const includeView = include.replace(/\.njk$/, "").replace(/^views\//, "");
        queue.push(includeView);
      }
    }

    return tree;
  }

  async analyzeControllerMethod(handler: string) {
    const parsed = handler.match(/(\w+Controller)\.(\w+)/);

    if (!parsed) {
      return null;
    }

    const controllerFile = `app/controllers/${parsed[1]}.js`;
    const content = await this.fs.readFile(controllerFile);

    return parseControllerMethod(content, controllerFile, parsed[2]);
  }

  async buildFeatureMap() {
    const routes = await this.getRoutes();
    const models = await this.getModels();
    const views = (await this.fs.listFilesRecursive("app/views")).filter((f) =>
      f.endsWith(".njk"),
    );
    const controllers = (await this.fs.listFilesRecursive("app/controllers")).filter(
      (f) => f.endsWith(".js"),
    );
    const migrations = await this.getMigrations();

    const features = ["auth", "dashboard", "categories", "snippets", "shared"] as const;

    return features.map((feature) => ({
      feature,
      routes: routes.filter((r) => r.feature === feature),
      controllers: controllers.filter((c) => {
        const name = c.split("/").pop() ?? "";
        if (feature === "auth") return name.includes("auth");
        if (feature === "dashboard") return name.includes("dashboard");
        if (feature === "categories") return name.includes("category");
        if (feature === "snippets") return name.includes("snippet");
        return name.includes("error") || false;
      }),
      views: views.filter((v) => {
        if (feature === "auth") return v.includes("/auth/");
        if (feature === "dashboard") return v.includes("/dashboard/");
        if (feature === "categories") return v.includes("/categories/");
        if (feature === "snippets") return v.includes("/snippets/") || v.includes("partials/snippets");
        if (feature === "shared") {
          return (
            v.includes("/errors/") ||
            v.includes("/layouts/") ||
            v.includes("/partials/")
          );
        }
        return false;
      }),
      models: models.filter((m) => {
        if (feature === "auth") return m.name === "User" || m.name === "Session";
        if (feature === "categories") return m.name === "Category";
        if (feature === "snippets") return m.name === "Snippet";
        return false;
      }),
      migrations: migrations.filter((migration) => {
        if (feature === "auth") {
          return ["Users", "Sessions"].includes(migration.tableName);
        }
        if (feature === "categories") return migration.tableName === "Categories";
        if (feature === "snippets") return migration.tableName === "Snippets";
        return false;
      }),
    }));
  }

  async buildDataSchema() {
    const migrations = await this.getMigrations();
    const models = await this.getModels();

    const relationships = models.flatMap((model) =>
      model.associations.map((assoc) => ({
        from: assoc.from,
        to: assoc.to,
        type: assoc.type,
      })),
    );

    const mermaidLines = ["erDiagram"];

    for (const migration of migrations) {
      const entity = migration.tableName.replace(/s$/, "");

      for (const column of migration.columns) {
        if (column.references) {
          const fromEntity = migration.tableName.replace(/s$/, "");
          const toEntity = column.references.model.replace(/s$/, "");
          mermaidLines.push(`  ${toEntity} ||--o{ ${fromEntity} : has`);
        }
      }

      if (!mermaidLines.some((l) => l.includes(entity))) {
        mermaidLines.push(`  ${entity} {`);
        for (const col of migration.columns) {
          if (col.name !== "id" && col.type) {
            mermaidLines.push(`    ${col.type} ${col.name}`);
          }
        }
        mermaidLines.push("  }");
      }
    }

    return {
      tables: migrations,
      models,
      relationships,
      mermaid: mermaidLines.join("\n"),
    };
  }

  async traceRequestFlow(method: string, path: string) {
    const routes = await this.getRoutes();
    const route = routes.find(
      (r) =>
        r.method === method.toUpperCase() &&
        matchPathPattern(r.path, path),
    );

    if (!route) {
      return {
        error: `Rota não encontrada: ${method.toUpperCase()} ${path}`,
        availableRoutes: routes.map((r) => `${r.method} ${r.path}`),
      };
    }

    const controllerAnalysis = route.handler
      ? await this.analyzeControllerMethod(route.handler)
      : null;

    const viewTrees = [];

    if (controllerAnalysis?.renders.length) {
      for (const render of controllerAnalysis.renders) {
        viewTrees.push({
          view: render.view,
          templateVars: render.templateVars,
          tree: await this.expandViewTree(render.view),
        });
      }
    }

    return {
      route,
      controller: controllerAnalysis,
      views: viewTrees,
    };
  }

  async extractApiContracts() {
    const routes = await this.getRoutes();
    const forms = await this.getAllForms();
    const mutatingRoutes = routes.filter((r) =>
      ["POST", "PUT", "DELETE", "PATCH"].includes(r.method),
    );

    const contracts = [];

    for (const route of mutatingRoutes) {
      const controllerAnalysis = route.handler
        ? await this.analyzeControllerMethod(route.handler)
        : null;

      const matchingForms = forms.filter((form) => {
        const methodMatches =
          form.method === route.method ||
          (route.method === "POST" && ["PUT", "DELETE"].includes(form.method)) ||
          (route.method === "PUT" && form.method === "PUT") ||
          (route.method === "DELETE" && form.method === "DELETE");

        return methodMatches && pathsLooselyMatch(form.action, route.path);
      });

      contracts.push({
        method: route.method,
        path: route.path,
        feature: route.feature,
        handler: route.handler,
        middlewares: route.middlewares,
        bodyFields: {
          fromController: controllerAnalysis?.bodyFields ?? [],
          fromForms: matchingForms.flatMap((f) => f.fields.map((field) => field.name)),
        },
        validation: extractValidationHints(controllerAnalysis),
        sideEffects: {
          flash: controllerAnalysis?.flashMessages ?? [],
          redirects: controllerAnalysis?.redirects ?? [],
          session: controllerAnalysis?.sessionUsage ?? [],
        },
        forms: matchingForms,
      });
    }

    return contracts;
  }
}

function matchPathPattern(pattern: string, requestPath: string): boolean {
  const patternParts = pattern.split("/").filter(Boolean);
  const requestParts = requestPath.split("/").filter(Boolean);

  if (patternParts.length !== requestParts.length) {
    return false;
  }

  return patternParts.every((part, i) =>
    part.startsWith(":") ? true : part === requestParts[i],
  );
}

function pathsLooselyMatch(formAction: string, routePath: string): boolean {
  const normalize = (p: string) =>
    p
      .split("?")[0]
      .replace(/\{\{[^}]+\}\}/g, ":id")
      .replace(/\/\d+/g, "/:id")
      .replace(/:\w+/g, "/:id");

  return normalize(formAction) === normalize(routePath);
}

function extractValidationHints(
  analysis: Awaited<ReturnType<LegacyContextService["analyzeControllerMethod"]>>,
) {
  if (!analysis) {
    return [];
  }

  const hints: string[] = [];

  if (analysis.sequelizeCalls.some((c) => c.includes("findOne"))) {
    hints.push("Verifica existência no banco antes de prosseguir");
  }

  if (analysis.flashMessages.some((f) => f.type === "error")) {
    hints.push("Retorna flash de erro e redirect em caso de falha");
  }

  return hints;
}
