import type { UiFeature, UiPatternType } from "../data/heroui-component-map.js";
import type { ParsedForm } from "./view.parser.js";

export type UiSourceKind = "view" | "partial" | "layout";

export interface UiPatternOccurrence {
  type: UiPatternType;
  path: string;
  feature: UiFeature;
  sourceKind: UiSourceKind;
  dataBindings: string[];
  actions: string[];
  states: string[];
  relatedTargets: string[];
  forms: ParsedForm[];
  migrationNotes: string[];
}

interface DetectUiPatternsArgs {
  content: string;
  path: string;
  feature: UiFeature;
  forms: ParsedForm[];
}

export function detectUiPatterns({
  content,
  path,
  feature,
  forms,
}: DetectUiPatternsArgs): UiPatternOccurrence[] {
  const occurrences = new Map<UiPatternType, UiPatternOccurrence>();
  const sourceKind = inferSourceKind(path);
  const templateBindings = extractTemplateBindings(content);
  const loopBindings = extractLoopBindings(content);
  const conditionalBindings = extractConditionalBindings(content);
  const formFields = forms.flatMap((form) => form.fields.map((field) => field.name));
  const targets = extractTargets(content, forms);

  const upsert = (
    type: UiPatternType,
    data: Partial<Omit<UiPatternOccurrence, "type" | "path" | "feature" | "sourceKind">>,
  ) => {
    const current =
      occurrences.get(type) ??
      {
        type,
        path,
        feature,
        sourceKind,
        dataBindings: [],
        actions: [],
        states: [],
        relatedTargets: [],
        forms: [],
        migrationNotes: [],
      };

    current.dataBindings = unique([
      ...current.dataBindings,
      ...(data.dataBindings ?? []),
    ]);
    current.actions = unique([...current.actions, ...(data.actions ?? [])]);
    current.states = unique([...current.states, ...(data.states ?? [])]);
    current.relatedTargets = unique([
      ...current.relatedTargets,
      ...(data.relatedTargets ?? []),
    ]);
    current.forms = dedupeForms([...current.forms, ...(data.forms ?? [])]);
    current.migrationNotes = unique([
      ...current.migrationNotes,
      ...(data.migrationNotes ?? []),
    ]);

    occurrences.set(type, current);
  };

  if (
    (feature === "auth" && forms.length > 0) ||
    content.includes("form-signin")
  ) {
    upsert("auth-form", {
      dataBindings: unique([...formFields, ...pickBindings(templateBindings, ["email", "name"])]),
      actions: [
        forms.some((form) => form.action.includes("/authenticate"))
          ? "submit login"
          : "submit auth form",
        forms.some((form) => form.action.includes("/register"))
          ? "submit registration"
          : "switch auth page",
      ],
      relatedTargets: unique([
        ...targets.formActions,
        ...targets.links.filter((link) => ["/", "/signup"].includes(link)),
      ]),
      forms,
    });
  }

  if (
    content.includes('<nav id="main">') ||
    content.includes("/app/categories/") ||
    content.includes("activeCategory")
  ) {
    upsert("sidebar-nav", {
      dataBindings: pickBindings(
        [...templateBindings, ...loopBindings, ...conditionalBindings],
        [
          "categories",
          "activeCategory",
          "category.id",
          "category.title",
          "category.Snippets.length",
        ],
      ),
      actions: unique([
        "navigate category",
        content.includes("_method=DELETE") ? "delete category" : "",
        content.includes("data-modal-open") ? "open create category modal" : "",
        content.includes("/signout") ? "sign out" : "",
      ]),
      states: content.includes("activeCategory") ? ["active-category"] : [],
      relatedTargets: unique([
        ...targets.links.filter((link) => link.startsWith("/app/categories/")),
        ...targets.links.filter((link) => link === "/signout"),
        ...targets.formActions.filter((action) => action.includes("/app/categories/")),
      ]),
      forms,
    });
  }

  if (content.includes("Snippets.length")) {
    upsert("count-badge", {
      dataBindings: pickBindings(templateBindings, ["category.Snippets.length"]),
      actions: ["display item count"],
    });
  }

  if (content.includes('class="modal"') || content.includes("data-modal-open")) {
    upsert("modal-form", {
      dataBindings: unique([...formFields, ...templateBindings]),
      actions: unique([
        content.includes("data-modal-open") ? "open modal" : "",
        content.includes("data-modal-close") ? "close modal" : "",
        ...forms.map((form) => `submit ${form.method} ${form.action}`),
      ]),
      relatedTargets: unique([
        ...targets.formActions,
        ...targets.links.filter((link) => link === "#"),
      ]),
      forms,
      migrationNotes: [
        "Legacy modal behavior is driven by jQuery data attributes.",
      ],
    });
  }

  if (
    content.includes("snippets-list") ||
    content.includes("for snippet in snippets")
  ) {
    upsert("snippet-list", {
      dataBindings: pickBindings(
        [...templateBindings, ...loopBindings],
        ["snippets", "snippet.id", "snippet.title", "snippet.excerpt", "activeCategory"],
      ),
      actions: unique([
        "navigate snippet",
        content.includes("data-modal-open") ? "open create snippet modal" : "",
      ]),
      relatedTargets: unique([
        ...targets.links.filter((link) => link.includes("/snippets/")),
        ...targets.formActions.filter((action) => action.includes("/snippets/create")),
      ]),
      forms,
    });
  }

  if (
    content.includes("btn-icon") ||
    content.includes("trash-icon") ||
    targets.formActions.some((action) => action.includes("_method=DELETE")) ||
    content.includes(">Remover<")
  ) {
    upsert("danger-icon-action", {
      dataBindings: pickBindings(templateBindings, ["category.id", "currentSnippet.id", "activeCategory"]),
      actions: ["trigger destructive action"],
      relatedTargets: targets.formActions.filter((action) =>
        action.includes("_method=DELETE"),
      ),
      forms,
    });
  }

  if (content.includes("{% if") && content.includes("active")) {
    upsert("active-state", {
      dataBindings: pickBindings(
        [...templateBindings, ...conditionalBindings],
        ["activeCategory", "category.id"],
      ),
      actions: ["toggle selected visual state"],
      states: ["active", "selected"],
    });
  }

  if (
    content.includes("snippet-content") ||
    content.includes("formattedContent") ||
    content.includes("currentSnippet.title")
  ) {
    upsert("detail-pane", {
      dataBindings: pickBindings(templateBindings, [
        "currentSnippet.title",
        "currentSnippet.formattedContent",
        "currentSnippet.content",
      ]),
      actions: ["view snippet details"],
      relatedTargets: targets.formActions.filter((action) =>
        action.includes("/snippets/"),
      ),
    });
  }

  if (content.includes('class="mde"') || content.includes("SimpleMDE")) {
    upsert("markdown-editor", {
      dataBindings: pickBindings(templateBindings, ["currentSnippet.content"]),
      actions: ["edit markdown content"],
      forms,
      migrationNotes: [
        "SimpleMDE is initialized outside the template via shared client-side scripts.",
      ],
    });
  }

  if (
    content.includes("flashSuccess") ||
    content.includes("flashError") ||
    content.includes("alert-success") ||
    content.includes("alert-danger")
  ) {
    upsert("flash-banner", {
      dataBindings: pickBindings(templateBindings, ["message", "flashSuccess", "flashError"]),
      actions: ["display mutation feedback"],
      states: ["success", "error"],
      migrationNotes: ["Legacy alerts auto-hide after a timeout."],
    });
  }

  if (
    sourceKind === "layout" ||
    content.includes("{% block body %}") ||
    content.includes("lucide.createIcons") ||
    content.includes("SimpleMDE")
  ) {
    upsert("layout-shell", {
      actions: unique([
        content.includes("lucide.createIcons") ? "bootstrap icons" : "",
        content.includes("SimpleMDE") ? "bootstrap markdown editor" : "",
      ]),
      relatedTargets: targets.scripts,
      migrationNotes: [
        "Shared global concerns should move into React providers and reusable layout components.",
      ],
    });
  }

  return [...occurrences.values()];
}

export function inferUiFeature(
  path: string,
  content: string,
  explicitFeature?: string,
): UiFeature {
  if (path.includes("/auth/")) {
    return "auth";
  }

  if (
    path.includes("partials/snippets.njk") ||
    path.includes("/snippets/") ||
    content.includes("snippets-list") ||
    content.includes("currentSnippet")
  ) {
    return "snippets";
  }

  if (
    path.includes("partials/nav.njk") ||
    content.includes("/app/categories/") ||
    content.includes("activeCategory")
  ) {
    return "categories";
  }

  if (path.includes("/dashboard/")) {
    return "dashboard";
  }

  if (
    path.includes("/layouts/") ||
    path.includes("/errors/") ||
    path.includes("partials/flash.njk") ||
    content.includes("flashSuccess") ||
    content.includes("flashError")
  ) {
    return "shared";
  }

  if (explicitFeature === "auth" || explicitFeature === "dashboard") {
    return explicitFeature;
  }

  if (explicitFeature === "categories" || explicitFeature === "snippets") {
    return explicitFeature;
  }

  return "shared";
}

function inferSourceKind(path: string): UiSourceKind {
  if (path.includes("/partials/")) {
    return "partial";
  }

  if (path.includes("/layouts/")) {
    return "layout";
  }

  return "view";
}

function extractTemplateBindings(content: string): string[] {
  return unique(
    [...content.matchAll(/\{\{\s*([^}|]+?)(?:\|[^}]*)?\s*\}\}/g)].map((match) =>
      match[1].trim(),
    ),
  );
}

function extractLoopBindings(content: string): string[] {
  return unique(
    [...content.matchAll(/{%\s*for\s+\w+\s+in\s+([^%]+?)\s*%}/g)].map((match) =>
      match[1].trim(),
    ),
  );
}

function extractConditionalBindings(content: string): string[] {
  return unique(
    [...content.matchAll(/{%\s*if\s+([^%]+?)\s*%}/g)].map((match) =>
      match[1].trim(),
    ),
  );
}

function extractTargets(content: string, forms: ParsedForm[]) {
  return {
    links: unique(
      [...content.matchAll(/href=["']([^"']+)["']/g)].map((match) => match[1]),
    ),
    scripts: unique(
      [...content.matchAll(/<script[^>]*src=["']([^"']+)["']/g)].map(
        (match) => match[1],
      ),
    ),
    formActions: unique(forms.map((form) => form.action)),
  };
}

function pickBindings(bindings: string[], expected: string[]): string[] {
  return unique(
    bindings.filter((binding) =>
      expected.some(
        (candidate) =>
          binding === candidate ||
          binding.includes(candidate) ||
          candidate.includes(binding),
      ),
    ),
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function dedupeForms(forms: ParsedForm[]): ParsedForm[] {
  const seen = new Set<string>();

  return forms.filter((form) => {
    const key = `${form.sourceFile}:${form.method}:${form.action}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
