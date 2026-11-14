import fs from "fs-extra";
import path from "node:path";
import type { PackageJsonConfig, FileTreeItem } from "../types/index.js";

export async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  if (!fs.existsSync(dirPath)) return true;
  const files = await fs.readdir(dirPath);
  return files.length === 0;
}

export async function writeProjectFile(
  targetDir: string,
  relativePath: string,
  content: string
): Promise<void> {
  const fullPath = path.join(targetDir, relativePath);
  await fs.ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, content.trim() + "\n", "utf8");
}

export async function writeProjectFiles(
  targetDir: string,
  files: FileTreeItem[]
): Promise<void> {
  for (const item of files) {
    await writeProjectFile(targetDir, item.path, item.content);
  }
}

export async function mergePackageJson(
  targetDir: string,
  base: Partial<PackageJsonConfig>
): Promise<void> {
  const pkgPath = path.join(targetDir, "package.json");
  let existing: Partial<PackageJsonConfig> = {};

  if (await fs.pathExists(pkgPath)) {
    try {
      existing = await fs.readJson(pkgPath);
    } catch {
      existing = {};
    }
  }

  const merged: PackageJsonConfig = {
    ...existing,
    ...base,
    name: base.name || existing.name || "devblueprint-project",
    version: base.version || existing.version || "0.1.0",
    private: true,
    type: base.type || existing.type || "module",
    scripts: {
      ...(existing.scripts || {}),
      ...(base.scripts || {}),
    },
    dependencies: sortDependencies({
      ...(existing.dependencies || {}),
      ...(base.dependencies || {}),
    }),
    devDependencies: sortDependencies({
      ...(existing.devDependencies || {}),
      ...(base.devDependencies || {}),
    }),
    ...(existing.overrides || base.overrides
      ? {
          overrides: {
            ...((existing.overrides as Record<string, string>) || {}),
            ...((base.overrides as Record<string, string>) || {}),
          },
        }
      : {}),
  };

  await fs.writeJson(pkgPath, merged, { spaces: 2 });
}

function sortDependencies(
  deps: Record<string, string>
): Record<string, string> {
  const sorted: Record<string, string> = {};
  for (const key of Object.keys(deps).sort()) {
    sorted[key] = deps[key];
  }
  return sorted;
}
