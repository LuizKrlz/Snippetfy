import fs from "node:fs/promises";
import path from "node:path";

import { normalizeLegacyPath } from "../utils/path.util.js";

export class FilesystemAdapter {
  constructor(private rootPath: string) {}

  private async walk(dir: string, fileList: string[] = []): Promise<string[]> {
    try {
      const files = await fs.readdir(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);

        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          await this.walk(fullPath, fileList);
        } else {
          fileList.push(fullPath);
        }
      }
    } catch {
      return fileList;
    }

    return fileList;
  }

  async listFilesRecursive(folder: string) {
    const targetPath = path.join(this.rootPath, folder);

    const files = await this.walk(targetPath);

    return files.map((file) => path.relative(this.rootPath, file));
  }

  async readFile(relativePath: string) {
    const fullPath = path.join(
      this.rootPath,
      normalizeLegacyPath(relativePath),
    );

    return fs.readFile(fullPath, "utf-8");
  }

  async searchTextRecursive(folder: string, text: string) {
    const files = await this.listFilesRecursive(folder);

    const matches: { file: string; lineNumbers: number[] }[] = [];

    for (const file of files) {
      const content = await this.readFile(file);

      if (!content.includes(text)) {
        continue;
      }

      const lineNumbers = content
        .split("\n")
        .map((line: string, index: number) =>
          line.includes(text) ? index + 1 : 0,
        )
        .filter((n: number) => n > 0);

      matches.push({ file, lineNumbers });
    }

    return matches;
  }
}
