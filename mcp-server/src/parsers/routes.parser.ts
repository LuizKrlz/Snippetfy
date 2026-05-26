export interface ParsedRoute {
  method: string;
  path: string;
  middlewares: string[];
  handler: string;
  feature: string;
  handlers: string[];
}

export function inferFeature(handler: string, path: string): string {
  if (
    handler.includes("authController") ||
    ["/", "/signup", "/signout"].includes(path) ||
    path === "/register" ||
    path === "/authenticate"
  ) {
    return "auth";
  }

  if (handler.includes("dashboardController") || path.includes("/dashboard")) {
    return "dashboard";
  }

  if (handler.includes("snippetController") || path.includes("/snippets")) {
    return "snippets";
  }

  if (handler.includes("categoryController") || path.includes("/categories")) {
    return "categories";
  }

  if (path.includes("errors") || handler.includes("res.render")) {
    return "shared";
  }

  return "shared";
}

export function parseRoutesFile(content: string): ParsedRoute[] {
  const routes: ParsedRoute[] = [];
  let appMountMiddleware: string | null = null;

  const source = content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ");

  const mountMatch = source.match(
    /routes\.use\(\s*["']\/app["']\s*,\s*(\w+)\s*\)/,
  );

  if (mountMatch) {
    appMountMiddleware = mountMatch[1];
  }

  const routeRegex =
    /routes\.(get|post|put|delete|patch)\(\s*["']([^"']*)["']\s*,\s*([^)]+)\)\s*;/g;

  let routeMatch = routeRegex.exec(source);

  while (routeMatch) {
    const method = routeMatch[1].toUpperCase();
    const routePath = routeMatch[2];
    const handlersRaw = routeMatch[3];

    const handlers = handlersRaw
      .split(",")
      .map((h) => h.trim())
      .filter((h) => h && !h.startsWith("("));

    const middlewares: string[] = [];
    let handler = "";

    for (const h of handlers) {
      if (h.includes("Controller.")) {
        handler = h;
      } else if (
        h.endsWith("Middleware") ||
        h === "authMiddleware" ||
        h === "guestMiddleware"
      ) {
        middlewares.push(h);
      }
    }

    if (appMountMiddleware && routePath.startsWith("/app")) {
      if (!middlewares.includes(appMountMiddleware)) {
        middlewares.unshift(appMountMiddleware);
      }
    }

    routes.push({
      method,
      path: routePath,
      middlewares,
      handler,
      feature: inferFeature(handler, routePath),
      handlers,
    });

    routeMatch = routeRegex.exec(source);
  }

  return routes;
}

export function matchRoutePath(
  pattern: string,
  requestPath: string,
): boolean {
  const patternParts = pattern.split("/").filter(Boolean);
  const requestParts = requestPath.split("/").filter(Boolean);

  if (patternParts.length !== requestParts.length) {
    return false;
  }

  return patternParts.every((part, index) => {
    if (part.startsWith(":")) {
      return true;
    }

    return part === requestParts[index];
  });
}

export function findRoute(
  routes: ParsedRoute[],
  method: string,
  requestPath: string,
): ParsedRoute | undefined {
  const normalizedMethod = method.toUpperCase();

  return routes.find(
    (route) =>
      route.method === normalizedMethod &&
      matchRoutePath(route.path, requestPath),
  );
}
