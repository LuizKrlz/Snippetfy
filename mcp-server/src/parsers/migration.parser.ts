export interface ColumnDefinition {
  name: string;
  type: string;
  allowNull?: boolean;
  unique?: boolean;
  references?: { model: string; key: string };
}

export interface TableSchema {
  tableName: string;
  columns: ColumnDefinition[];
  file: string;
}

export function parseMigrationFile(
  content: string,
  file: string,
): TableSchema | null {
  const tableMatch = content.match(/createTable\(\s*['"](\w+)['"]/);

  if (!tableMatch) {
    return null;
  }

  const columns: ColumnDefinition[] = [];
  const columnBlockRegex = /(\w+):\s*\{([^}]*)\}/g;

  let blockMatch = columnBlockRegex.exec(content);

  while (blockMatch) {
    const columnName = blockMatch[1];
    const block = blockMatch[2];

    const typeMatch = block.match(/type:\s*DataTypes\.(\w+)/);
    const refMatch = block.match(
      /references:\s*\{\s*model:\s*['"](\w+)['"]\s*,\s*key:\s*['"](\w+)['"]/,
    );

    if (!typeMatch && !refMatch && columnName !== "id") {
      blockMatch = columnBlockRegex.exec(content);
      continue;
    }

    const column: ColumnDefinition = {
      name: columnName,
      type: "UNKNOWN",
    };

    if (typeMatch) {
      column.type = typeMatch[1];
    } else if (refMatch) {
      column.type = "INTEGER";
      column.references = { model: refMatch[1], key: refMatch[2] };
    } else if (columnName === "id") {
      column.type = "INTEGER";
    } else {
      blockMatch = columnBlockRegex.exec(content);
      continue;
    }

    const allowNullMatch = block.match(/allowNull:\s*(true|false)/);

    if (allowNullMatch) {
      column.allowNull = allowNullMatch[1] === "true";
    }

    if (block.includes("unique: true")) {
      column.unique = true;
    }

    columns.push(column);
    blockMatch = columnBlockRegex.exec(content);
  }

  return {
    tableName: tableMatch[1],
    columns,
    file,
  };
}
