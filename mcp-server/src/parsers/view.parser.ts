export interface ParsedForm {
  action: string;
  method: string;
  fields: { name: string; type: string }[];
  sourceFile: string;
}

export function parseViewIncludes(content: string): string[] {
  return [...content.matchAll(/{%\s*include\s+['"]([^'"]+)['"]/g)].map(
    (m) => m[1],
  );
}

export function parseViewExtends(content: string): string | null {
  const match = content.match(/{%\s*extends\s+['"]([^'"]+)['"]/);

  return match ? match[1] : null;
}

export function parseFormsInView(
  content: string,
  sourceFile: string,
): ParsedForm[] {
  const forms: ParsedForm[] = [];
  const formRegex =
    /<form[^>]*action=["']([^"']+)["'][^>]*method=["']([^"']+)["'][^>]*>([\s\S]*?)<\/form>/gi;

  let formMatch = formRegex.exec(content);

  while (formMatch) {
    const formBody = formMatch[3];
    const fields: { name: string; type: string }[] = [];

    const inputRegex =
      /<(?:input|textarea|select)[^>]*name=["']([^"']+)["'][^>]*>/gi;

    let inputMatch = inputRegex.exec(formBody);

    while (inputMatch) {
      const name = inputMatch[1];
      const tag = inputMatch[0];
      const typeMatch = tag.match(/type=["']([^"']+)["']/);
      const type = typeMatch
        ? typeMatch[1]
        : tag.startsWith("<textarea")
          ? "textarea"
          : "text";

      fields.push({ name, type });
      inputMatch = inputRegex.exec(formBody);
    }

    let method = formMatch[2].toUpperCase();

    if (formMatch[0].includes("_method=PUT") || formMatch[0].includes("_method=DELETE")) {
      const overrideMatch = formMatch[0].match(/_method=(PUT|DELETE)/i);

      if (overrideMatch) {
        method = overrideMatch[1].toUpperCase();
      }
    }

    forms.push({
      action: formMatch[1],
      method,
      fields,
      sourceFile,
    });

    formMatch = formRegex.exec(content);
  }

  return forms;
}

export function resolveViewPath(viewName: string): string {
  return `app/views/${viewName}.njk`;
}
