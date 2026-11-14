import path from "node:path";
import type { CLIOptions, ProjectConfig, ProjectFolder } from "../types/index.js";
import { DEFAULT_CONFIG, ALL_PROJECT_FOLDERS } from "./defaults.js";
import { detectPackageManager } from "../utils/package-manager.js";

export function resolveConfiguration(
  args: Partial<CLIOptions>,
  promptAnswers?: Partial<ProjectConfig>
): ProjectConfig {
  const detectedPkg = detectPackageManager();
  const projectName =
    args.name || promptAnswers?.projectName || DEFAULT_CONFIG.projectName;

  const targetDir = path.resolve(
    process.cwd(),
    promptAnswers?.targetDir || projectName
  );

  const framework =
    args.framework || promptAnswers?.framework || DEFAULT_CONFIG.framework;

  const language =
    args.language || promptAnswers?.language || DEFAULT_CONFIG.language;

  const architecture =
    args.architecture ||
    promptAnswers?.architecture ||
    DEFAULT_CONFIG.architecture;

  const folders: ProjectFolder[] =
    args.folders ||
    promptAnswers?.folders ||
    (architecture === "minimal"
      ? ["components", "config", "layouts"]
      : [...ALL_PROJECT_FOLDERS]);

  // Synchronize integrations with selected folders
  const rawIntegrations =
    args.integrations ||
    promptAnswers?.integrations ||
    DEFAULT_CONFIG.integrations;

  // Filter out integrations if their corresponding folders were explicitly omitted
  const activeIntegrations = rawIntegrations.filter((integ) => {
    if (integ === "redux" && !folders.includes("store") && !folders.includes("redux")) {
      return false;
    }
    if (integ === "axios" && !folders.includes("apiInstance") && !folders.includes("services")) {
      return false;
    }
    return true;
  });

  const packageManager =
    args.packageManager ||
    promptAnswers?.packageManager ||
    detectedPkg ||
    DEFAULT_CONFIG.packageManager;

  const installDeps =
    args.install !== undefined
      ? args.install
      : promptAnswers?.installDeps !== undefined
      ? promptAnswers.installDeps
      : DEFAULT_CONFIG.installDeps;

  const initGit =
    args.git !== undefined
      ? args.git
      : promptAnswers?.initGit !== undefined
      ? promptAnswers.initGit
      : DEFAULT_CONFIG.initGit;

  const preset =
    args.preset || promptAnswers?.preset || DEFAULT_CONFIG.preset;

  const fetchLatest =
    args.fetchLatest !== undefined
      ? args.fetchLatest
      : promptAnswers?.fetchLatest !== undefined
      ? promptAnswers.fetchLatest
      : DEFAULT_CONFIG.fetchLatest;

  // Parse package overrides
  const packageOverrides: Record<string, string> = {
    ...(DEFAULT_CONFIG.packageOverrides || {}),
    ...(promptAnswers?.packageOverrides || {}),
  };

  if (args.pkg && Array.isArray(args.pkg)) {
    for (const item of args.pkg) {
      const atIndex = item.lastIndexOf("@");
      if (atIndex > 0) {
        const name = item.slice(0, atIndex);
        const ver = item.slice(atIndex + 1);
        packageOverrides[name] = ver;
      }
    }
  }

  if (args.packageVersions) {
    try {
      const parsed = JSON.parse(args.packageVersions);
      Object.assign(packageOverrides, parsed);
    } catch {
      // Ignored if invalid json
    }
  }

  return {
    projectName,
    targetDir,
    framework,
    language,
    architecture,
    folders: Array.from(new Set(folders)),
    integrations: Array.from(new Set(activeIntegrations)),
    packageManager,
    installDeps,
    initGit,
    preset,
    packageOverrides,
    fetchLatest,
  };
}
