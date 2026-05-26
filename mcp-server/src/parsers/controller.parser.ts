export interface ControllerMethodAnalysis {
  controller: string;
  method: string;
  renders: { view: string; templateVars: string[] }[];
  sequelizeCalls: string[];
  bodyFields: string[];
  sessionUsage: string[];
  flashMessages: { type: string; message: string }[];
  redirects: string[];
}

export function parseHandler(handler: string): {
  controllerFile: string;
  methodName: string;
} | null {
  const match = handler.match(/(\w+Controller)\.(\w+)/);

  if (!match) {
    return null;
  }

  return {
    controllerFile: `app/controllers/${match[1]}.js`,
    methodName: match[2],
  };
}

function extractMethodBody(content: string, methodName: string): string | null {
  const methodStart = new RegExp(
    `(?:async\\s+)?${methodName}\\s*\\([^)]*\\)\\s*\\{`,
  );
  const startMatch = methodStart.exec(content);

  if (!startMatch || startMatch.index === undefined) {
    return null;
  }

  const startIndex = startMatch.index + startMatch[0].length;
  let depth = 1;
  let index = startIndex;

  while (index < content.length && depth > 0) {
    const char = content[index];

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
    }

    index += 1;
  }

  return content.slice(startIndex, index - 1);
}

export function parseControllerMethod(
  content: string,
  controllerFile: string,
  methodName: string,
): ControllerMethodAnalysis | null {
  const body = extractMethodBody(content, methodName);

  if (!body) {
    return null;
  }

  const controller = controllerFile.replace("app/controllers/", "").replace(".js", "");

  const renders: { view: string; templateVars: string[] }[] = [];
  const renderRegex =
    /res\.render\(\s*['"]([^'"]+)['"]\s*(?:,\s*\{([^}]*)\})?\s*\)/g;

  let renderMatch = renderRegex.exec(body);

  while (renderMatch) {
    const templateVars = renderMatch[2]
      ? renderMatch[2]
          .split(",")
          .map((v) => v.trim().split(":")[0].trim())
          .filter(Boolean)
      : [];

    renders.push({ view: renderMatch[1], templateVars });
    renderMatch = renderRegex.exec(body);
  }

  const sequelizeCalls = [
    ...body.matchAll(
      /await\s+(\w+)\.(findAll|findOne|findById|create|update|destroy)\([^)]*\)/g,
    ),
  ].map((m) => `${m[1]}.${m[2]}(...)`);

  const bodyFields = new Set<string>();

  for (const match of body.matchAll(/req\.body\.(\w+)/g)) {
    bodyFields.add(match[1]);
  }

  if (body.includes("...req.body")) {
    bodyFields.add("*(spread req.body)");
  }

  const sessionUsage = [
    ...new Set([...body.matchAll(/req\.session\.(\w+)/g)].map((m) => m[1])),
  ];

  const flashMessages = [...body.matchAll(/req\.flash\(\s*['"](\w+)['"]\s*,\s*['"]([^'"]+)['"]/g)].map(
    (m) => ({ type: m[1], message: m[2] }),
  );

  const redirects = [...body.matchAll(/res\.redirect\(\s*['"`]([^'"`]+)['"`]/g)].map(
    (m) => m[1],
  );

  return {
    controller,
    method: methodName,
    renders,
    sequelizeCalls,
    bodyFields: [...bodyFields],
    sessionUsage,
    flashMessages,
    redirects,
  };
}
