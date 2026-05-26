import { FilesystemAdapter } from "../adapters/filesystem.adapter.js";
import {
  getHeroUiSuggestion,
  type HeroUiSuggestion,
  getShadcnSuggestion,
  type ShadcnSuggestion,
  type UiFeature,
  type UiPatternType,
} from "../data/heroui-component-map.js";
import {
  detectUiPatterns,
  inferUiFeature,
  type UiPatternOccurrence,
  type UiSourceKind,
} from "../parsers/ui-component.parser.js";
import type { ParsedForm } from "../parsers/view.parser.js";
import { LegacyContextService } from "./legacy-context.service.js";

export type UiGroupingMode = "view" | "component-type" | "feature";

export interface MapUiComponentsOptions {
  feature?: UiFeature;
  includeSuggestions?: boolean;
  groupBy?: UiGroupingMode;
}

export interface CompareUiTargetsOptions {
  feature?: UiFeature;
  groupBy?: UiGroupingMode;
}

interface UiPatternAggregate {
  type: UiPatternType;
  count: number;
  paths: string[];
  features: UiFeature[];
  sourceKinds: UiSourceKind[];
  dataBindings: string[];
  actions: string[];
  states: string[];
  relatedTargets: string[];
  forms: ParsedForm[];
  heroUiSuggestion?: HeroUiSuggestion;
  migrationNotes: string[];
}

type UiOccurrenceWithSuggestion = UiPatternOccurrence & {
  heroUiSuggestion?: HeroUiSuggestion;
};

type UiTargetRecommendation = "heroui" | "shadcn" | "either";

interface UiTargetComparison {
  recommendedTarget: UiTargetRecommendation;
  rationale: string[];
}

type UiOccurrenceComparison = UiPatternOccurrence & {
  heroUiSuggestion: HeroUiSuggestion;
  shadcnSuggestion: ShadcnSuggestion;
  comparison: UiTargetComparison;
};

type UiPatternAggregateComparison = UiPatternAggregate & {
  heroUiSuggestion: HeroUiSuggestion;
  shadcnSuggestion: ShadcnSuggestion;
  comparison: UiTargetComparison;
};

export class UiMappingService {
  constructor(
    private readonly context: LegacyContextService,
    private readonly fs: FilesystemAdapter,
  ) {}

  async mapUiComponents(options: MapUiComponentsOptions = {}) {
    const includeSuggestions = options.includeSuggestions ?? true;
    const groupBy = options.groupBy ?? "component-type";
    const featureMap = await this.context.buildFeatureMap();
    const explicitFeatureByPath = buildExplicitFeatureMap(featureMap);
    const formsByPath = groupFormsByPath(await this.context.getAllForms());
    const viewFiles = (await this.fs.listFilesRecursive("app/views")).filter((file) =>
      file.endsWith(".njk"),
    );

    const occurrences: UiOccurrenceWithSuggestion[] = [];

    for (const file of viewFiles) {
      const content = await this.fs.readFile(file);
      const feature = inferUiFeature(file, content, explicitFeatureByPath.get(file));

      if (options.feature && feature !== options.feature) {
        continue;
      }

      const forms = formsByPath.get(file) ?? [];
      const detected = detectUiPatterns({
        content,
        path: file,
        feature,
        forms,
      }).map((occurrence) => ({
        ...occurrence,
        ...(includeSuggestions
          ? { heroUiSuggestion: getHeroUiSuggestion(occurrence.type) }
          : {}),
      }));

      occurrences.push(...detected);
    }

    return {
      filter: {
        feature: options.feature ?? null,
        includeSuggestions,
      },
      groupBy,
      summary: {
        scannedFiles: options.feature
          ? occurrences.length > 0
            ? unique(occurrences.map((occurrence) => occurrence.path)).length
            : 0
          : viewFiles.length,
        totalOccurrences: occurrences.length,
        byFeature: countBy(occurrences, (occurrence) => occurrence.feature),
        byType: countBy(occurrences, (occurrence) => occurrence.type),
      },
      occurrences,
      inventory: buildInventory(occurrences, groupBy),
    };
  }

  async compareUiTargets(options: CompareUiTargetsOptions = {}) {
    const groupBy = options.groupBy ?? "component-type";
    const base = await this.mapUiComponents({
      feature: options.feature,
      includeSuggestions: false,
      groupBy,
    });

    const occurrences = base.occurrences.map((occurrence) =>
      enrichOccurrenceWithComparison(occurrence),
    );

    let inventory:
      | UiPatternAggregateComparison[]
      | {
          view: string;
          feature: UiFeature;
          sourceKind: UiSourceKind;
          components: UiOccurrenceComparison[];
          componentCount: number;
        }[]
      | {
          feature: UiFeature;
          components: UiPatternAggregateComparison[];
          componentCount: number;
        }[];

    if (groupBy === "view") {
      inventory = (base.inventory as {
        view: string;
        feature: UiFeature;
        sourceKind: UiSourceKind;
        components: UiPatternOccurrence[];
        componentCount: number;
      }[]).map((group) => ({
        ...group,
        components: group.components.map((component) =>
          enrichOccurrenceWithComparison(component),
        ),
      }));
    } else if (groupBy === "feature") {
      inventory = (base.inventory as {
        feature: UiFeature;
        components: UiPatternAggregate[];
        componentCount: number;
      }[]).map((group) => ({
        ...group,
        components: group.components.map((component) =>
          enrichAggregateWithComparison(component),
        ),
      }));
    } else {
      inventory = (base.inventory as UiPatternAggregate[]).map((component) =>
        enrichAggregateWithComparison(component),
      );
    }

    return {
      filter: {
        feature: options.feature ?? null,
      },
      groupBy,
      targetLibraries: ["heroui", "shadcn"] as const,
      summary: {
        ...base.summary,
        recommendedByTarget: countBy(occurrences, (occurrence) =>
          occurrence.comparison.recommendedTarget,
        ),
      },
      occurrences,
      inventory,
    };
  }
}

function buildInventory(
  occurrences: UiOccurrenceWithSuggestion[],
  groupBy: UiGroupingMode,
) {
  if (groupBy === "view") {
    const groups = new Map<string, {
      view: string;
      feature: UiFeature;
      sourceKind: UiSourceKind;
      components: UiOccurrenceWithSuggestion[];
    }>();

    for (const occurrence of occurrences) {
      const key = occurrence.path;
      const current =
        groups.get(key) ??
        {
          view: occurrence.path,
          feature: occurrence.feature,
          sourceKind: occurrence.sourceKind,
          components: [],
        };

      current.components.push(occurrence);
      groups.set(key, current);
    }

    return [...groups.values()].map((group) => ({
      ...group,
      componentCount: group.components.length,
    }));
  }

  if (groupBy === "feature") {
    const groups = new Map<UiFeature, { feature: UiFeature; components: UiPatternAggregate[] }>();

    for (const feature of ["auth", "dashboard", "categories", "snippets", "shared"] as const) {
      groups.set(feature, { feature, components: [] });
    }

    const aggregates = aggregateByType(occurrences, (occurrence) =>
      `${occurrence.feature}:${occurrence.type}`,
    );

    for (const aggregate of aggregates) {
      const feature = aggregate.features[0];
      groups.get(feature)?.components.push(aggregate);
    }

    return [...groups.values()]
      .filter((group) => group.components.length > 0)
      .map((group) => ({
        ...group,
        componentCount: group.components.reduce(
          (total, component) => total + component.count,
          0,
        ),
      }));
  }

  return aggregateByType(occurrences, (occurrence) => occurrence.type);
}

function aggregateByType(
  occurrences: UiOccurrenceWithSuggestion[],
  keyFn: (occurrence: UiOccurrenceWithSuggestion) => string,
): UiPatternAggregate[] {
  const groups = new Map<string, UiPatternAggregate>();

  for (const occurrence of occurrences) {
    const key = keyFn(occurrence);
    const current =
      groups.get(key) ??
      {
        type: occurrence.type,
        count: 0,
        paths: [],
        features: [],
        sourceKinds: [],
        dataBindings: [],
        actions: [],
        states: [],
        relatedTargets: [],
        forms: [],
        migrationNotes: [],
        ...(occurrence.heroUiSuggestion
          ? { heroUiSuggestion: occurrence.heroUiSuggestion }
          : {}),
      };

    current.count += 1;
    current.paths = unique([...current.paths, occurrence.path]);
    current.features = unique([...current.features, occurrence.feature]);
    current.sourceKinds = unique([...current.sourceKinds, occurrence.sourceKind]);
    current.dataBindings = unique([
      ...current.dataBindings,
      ...occurrence.dataBindings,
    ]);
    current.actions = unique([...current.actions, ...occurrence.actions]);
    current.states = unique([...current.states, ...occurrence.states]);
    current.relatedTargets = unique([
      ...current.relatedTargets,
      ...occurrence.relatedTargets,
    ]);
    current.forms = dedupeForms([...current.forms, ...occurrence.forms]);
    current.migrationNotes = unique([
      ...current.migrationNotes,
      ...occurrence.migrationNotes,
      ...(occurrence.heroUiSuggestion?.migrationNotes ?? []),
    ]);

    if (!current.heroUiSuggestion && occurrence.heroUiSuggestion) {
      current.heroUiSuggestion = occurrence.heroUiSuggestion;
    }

    groups.set(key, current);
  }

  return [...groups.values()].sort((a, b) =>
    a.type === b.type ? a.paths[0].localeCompare(b.paths[0]) : a.type.localeCompare(b.type),
  );
}

function buildExplicitFeatureMap(
  featureMap: Awaited<ReturnType<LegacyContextService["buildFeatureMap"]>>,
) {
  const map = new Map<string, UiFeature>();

  for (const entry of featureMap) {
    for (const view of entry.views) {
      map.set(view, entry.feature as UiFeature);
    }
  }

  return map;
}

function groupFormsByPath(forms: ParsedForm[]) {
  const map = new Map<string, ParsedForm[]>();

  for (const form of forms) {
    const current = map.get(form.sourceFile) ?? [];
    current.push(form);
    map.set(form.sourceFile, current);
  }

  return map;
}

function dedupeForms(forms: ParsedForm[]) {
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

function countBy<T>(
  items: T[],
  keyFn: (item: T) => string,
): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function enrichOccurrenceWithComparison(
  occurrence: UiPatternOccurrence,
): UiOccurrenceComparison {
  const heroUiSuggestion = getHeroUiSuggestion(occurrence.type);
  const shadcnSuggestion = getShadcnSuggestion(occurrence.type);

  return {
    ...occurrence,
    heroUiSuggestion,
    shadcnSuggestion,
    comparison: compareTargets(occurrence.type, heroUiSuggestion, shadcnSuggestion),
  };
}

function enrichAggregateWithComparison(
  aggregate: UiPatternAggregate,
): UiPatternAggregateComparison {
  const heroUiSuggestion = getHeroUiSuggestion(aggregate.type);
  const shadcnSuggestion = getShadcnSuggestion(aggregate.type);

  return {
    ...aggregate,
    heroUiSuggestion,
    shadcnSuggestion,
    migrationNotes: unique([
      ...aggregate.migrationNotes,
      ...heroUiSuggestion.migrationNotes,
      ...shadcnSuggestion.migrationNotes,
    ]),
    comparison: compareTargets(aggregate.type, heroUiSuggestion, shadcnSuggestion),
  };
}

function compareTargets(
  type: UiPatternType,
  heroUiSuggestion: HeroUiSuggestion,
  shadcnSuggestion: ShadcnSuggestion,
): UiTargetComparison {
  const heroScore = scoreConfidence(heroUiSuggestion.confidence);
  const shadcnScore = scoreConfidence(shadcnSuggestion.confidence);

  if (heroScore > shadcnScore) {
    return {
      recommendedTarget: "heroui",
      rationale: [
        "HeroUI has a stronger direct match for this pattern.",
        `HeroUI confidence: ${heroUiSuggestion.confidence}; shadcn confidence: ${shadcnSuggestion.confidence}.`,
      ],
    };
  }

  if (shadcnScore > heroScore) {
    return {
      recommendedTarget: "shadcn",
      rationale: [
        "shadcn/ui has a stronger direct match for this pattern.",
        `HeroUI confidence: ${heroUiSuggestion.confidence}; shadcn confidence: ${shadcnSuggestion.confidence}.`,
      ],
    };
  }

  if (["sidebar-nav", "snippet-list", "active-state"].includes(type)) {
    return {
      recommendedTarget: "heroui",
      rationale: [
        "Both libraries are viable, but HeroUI has slightly better fit for interactive list-like patterns in this migration.",
      ],
    };
  }

  if (["danger-icon-action", "flash-banner"].includes(type)) {
    return {
      recommendedTarget: "shadcn",
      rationale: [
        "Both libraries are viable, but shadcn/ui composes cleanly with simple destructive actions and toast-style feedback.",
      ],
    };
  }

  return {
    recommendedTarget: "either",
    rationale: [
      "Both libraries are a reasonable fit for this pattern with similar migration effort.",
    ],
  };
}

function scoreConfidence(confidence: "high" | "medium" | "low") {
  if (confidence === "high") {
    return 3;
  }

  if (confidence === "medium") {
    return 2;
  }

  return 1;
}
