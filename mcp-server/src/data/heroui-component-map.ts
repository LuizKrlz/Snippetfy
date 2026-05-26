export const UI_PATTERN_TYPES = [
  "auth-form",
  "sidebar-nav",
  "count-badge",
  "modal-form",
  "snippet-list",
  "danger-icon-action",
  "active-state",
  "detail-pane",
  "markdown-editor",
  "flash-banner",
  "layout-shell",
] as const;

export type UiPatternType = (typeof UI_PATTERN_TYPES)[number];

export type UiFeature =
  | "auth"
  | "dashboard"
  | "categories"
  | "snippets"
  | "shared";

export interface UiLibrarySuggestion {
  primary: string;
  confidence: "high" | "medium" | "low";
  alternatives?: string[];
  migrationNotes: string[];
}

export type HeroUiSuggestion = UiLibrarySuggestion;
export type ShadcnSuggestion = UiLibrarySuggestion;

export const HEROUI_COMPONENT_MAP: Record<UiPatternType, HeroUiSuggestion> = {
  "auth-form": {
    primary: "Card + Input + Button + Link",
    confidence: "high",
    alternatives: ["Form + Input + Button"],
    migrationNotes: [
      "Compose a centered auth shell around HeroUI Card.",
      "Keep field-level validation close to the inputs.",
    ],
  },
  "sidebar-nav": {
    primary: "Listbox + Badge + Button + Modal + Input",
    confidence: "medium",
    alternatives: ["Listbox + Chip + Button"],
    migrationNotes: [
      "HeroUI has no dedicated app sidebar primitive; compose it from layout and Listbox.",
      "Active category state should be driven by the client router.",
    ],
  },
  "count-badge": {
    primary: "Badge",
    confidence: "high",
    alternatives: ["Chip"],
    migrationNotes: [
      "Use the count badge as a secondary signal inside nav and list rows.",
    ],
  },
  "modal-form": {
    primary: "Modal + Input + Textarea + Button",
    confidence: "high",
    alternatives: ["Drawer + Form controls"],
    migrationNotes: [
      "Modal open and close state will move from jQuery handlers to React state.",
    ],
  },
  "snippet-list": {
    primary: "Listbox + Card",
    confidence: "medium",
    alternatives: ["Custom list with Card"],
    migrationNotes: [
      "Snippet rows mix navigation and preview text, so custom row composition may fit better than a strict menu.",
    ],
  },
  "danger-icon-action": {
    primary: "Button (isIconOnly, color danger)",
    confidence: "high",
    alternatives: ["Dropdown action item"],
    migrationNotes: [
      "Confirm destructive actions in the client if the interaction needs more guardrails.",
    ],
  },
  "active-state": {
    primary: "Listbox selectedKeys + data-selected styling",
    confidence: "medium",
    alternatives: ["Controlled Tabs or custom selected styling"],
    migrationNotes: [
      "Map Nunjucks conditional classes to router-aware selected state in React.",
    ],
  },
  "detail-pane": {
    primary: "Card + ScrollShadow",
    confidence: "medium",
    alternatives: ["Card + custom content container"],
    migrationNotes: [
      "Rendered markdown should live in a readable content pane with typography styles.",
    ],
  },
  "markdown-editor": {
    primary: "Textarea + custom markdown editor integration",
    confidence: "low",
    alternatives: ["Textarea + toolbar wrapper"],
    migrationNotes: [
      "HeroUI does not ship a full markdown editor; integrate an editor package and wrap it with HeroUI form chrome.",
    ],
  },
  "flash-banner": {
    primary: "Snackbar + Alert",
    confidence: "medium",
    alternatives: ["Toast only"],
    migrationNotes: [
      "Legacy flash messages should become client-side toasts or inline alerts after mutations.",
    ],
  },
  "layout-shell": {
    primary: "Navbar + main layout + shared providers",
    confidence: "medium",
    alternatives: ["App shell with custom header"],
    migrationNotes: [
      "Global scripts such as icon bootstrapping and editor setup should move into React providers and component wrappers.",
    ],
  },
};

export function getHeroUiSuggestion(type: UiPatternType): HeroUiSuggestion {
  return HEROUI_COMPONENT_MAP[type];
}

export const SHADCN_COMPONENT_MAP: Record<UiPatternType, ShadcnSuggestion> = {
  "auth-form": {
    primary: "Card + Input + Button + Form",
    confidence: "high",
    alternatives: ["Card + react-hook-form fields"],
    migrationNotes: [
      "shadcn/ui favors composable primitives and form wrappers over a single opinionated auth component.",
      "Validation usually pairs naturally with react-hook-form and zod.",
    ],
  },
  "sidebar-nav": {
    primary: "Sidebar + Button + Badge + Dialog + Input",
    confidence: "medium",
    alternatives: ["NavigationMenu + custom layout"],
    migrationNotes: [
      "There is no single sidebar data component; compose the app shell from Sidebar and custom list rows.",
      "Selection state should be driven by the router and utility classes.",
    ],
  },
  "count-badge": {
    primary: "Badge",
    confidence: "high",
    alternatives: ["Badge variants"],
    migrationNotes: [
      "shadcn Badge is a close fit for count chips and status pills.",
    ],
  },
  "modal-form": {
    primary: "Dialog + Input + Textarea + Button",
    confidence: "high",
    alternatives: ["Sheet + Form"],
    migrationNotes: [
      "Dialog maps closely to the legacy create/edit modal flow.",
    ],
  },
  "snippet-list": {
    primary: "Card list + Button/Link rows",
    confidence: "medium",
    alternatives: ["ScrollArea + custom row components"],
    migrationNotes: [
      "shadcn/ui does not provide a data-heavy listbox primitive out of the box, so custom composition is common.",
    ],
  },
  "danger-icon-action": {
    primary: "Button (destructive variant) + Lucide icon",
    confidence: "high",
    alternatives: ["DropdownMenuItem (destructive styling)"],
    migrationNotes: [
      "This maps cleanly to shadcn Button variants and the Lucide icon set already used conceptually in the legacy app.",
    ],
  },
  "active-state": {
    primary: "Button or list row variants with router-aware class toggles",
    confidence: "medium",
    alternatives: ["Tabs-like controlled selected state"],
    migrationNotes: [
      "shadcn/ui relies on utility-class state styling rather than a built-in selected list component.",
    ],
  },
  "detail-pane": {
    primary: "Card + ScrollArea",
    confidence: "medium",
    alternatives: ["Prose content inside Card"],
    migrationNotes: [
      "The rendered markdown pane fits naturally in a Card with typography styling.",
    ],
  },
  "markdown-editor": {
    primary: "Textarea + external markdown editor integration",
    confidence: "low",
    alternatives: ["Textarea + toolbar wrapper"],
    migrationNotes: [
      "Like HeroUI, shadcn/ui does not ship a markdown editor; wrap a third-party editor in your own field component.",
    ],
  },
  "flash-banner": {
    primary: "Toast + Alert",
    confidence: "medium",
    alternatives: ["Sonner + inline Alert"],
    migrationNotes: [
      "shadcn projects often pair Alert with Sonner or a custom toast layer for mutation feedback.",
    ],
  },
  "layout-shell": {
    primary: "Sidebar + top-level layout + providers",
    confidence: "medium",
    alternatives: ["Navbar + custom shell"],
    migrationNotes: [
      "The app shell is usually assembled from primitives rather than a single framework layout component.",
    ],
  },
};

export function getShadcnSuggestion(type: UiPatternType): ShadcnSuggestion {
  return SHADCN_COMPONENT_MAP[type];
}
