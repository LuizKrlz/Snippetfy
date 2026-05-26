export interface ModelAssociation {
  from: string;
  type: "hasMany" | "hasOne" | "belongsTo" | "belongsToMany";
  to: string;
}

export interface ParsedModel {
  name: string;
  file: string;
  attributes: string[];
  associations: ModelAssociation[];
  getterMethods: string[];
}

export function parseModelFile(content: string, file: string): ParsedModel {
  const nameMatch = content.match(/define\(\s*['"](\w+)['"]/);
  const name = nameMatch ? nameMatch[1] : file.replace(/.*\//, "").replace(".js", "");

  const attributes = [...content.matchAll(/(\w+):\s*DataTypes\.\w+/g)]
    .map((m) => m[1])
    .filter((attr) => !["sequelize", "DataTypes"].includes(attr));

  const associations: ModelAssociation[] = [];

  for (const match of content.matchAll(
    /\.(hasMany|hasOne|belongsTo|belongsToMany)\(\s*models\.(\w+)/g,
  )) {
    associations.push({
      from: name,
      type: match[1] as ModelAssociation["type"],
      to: match[2],
    });
  }

  const getterMethods = [
    ...content.matchAll(/(\w+)\(\)\s*\{/g),
  ]
    .map((m) => m[1])
    .filter((method) => content.includes(`getterMethods`));

  return {
    name,
    file,
    attributes,
    associations,
    getterMethods,
  };
}
