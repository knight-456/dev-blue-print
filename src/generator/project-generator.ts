import type { ProjectConfig, ValidationResult } from "../types/index.js";
import { validateConfiguration } from "../validation/engine.js";
import { ensureDirectory, mergePackageJson, writeProjectFiles } from "../utils/file-system.js";
import { initGitRepository, runInstall } from "../utils/package-manager.js";
import { getViteConfig } from "./framework-providers/vite-provider.js";
import { getNextConfig } from "./framework-providers/next-provider.js";
import { getCraConfig } from "./framework-providers/cra-provider.js";
import { resolveIntegrations } from "./integrations/index.js";
import { getFeatureArchitectureFiles } from "./architecture/feature-architecture.js";

export interface GenerationResult {
  success: boolean;
  targetDir: string;
  filesGenerated: number;
  warnings: string[];
  errors: string[];
}

export async function generateProject(
  config: ProjectConfig
): Promise<GenerationResult> {
  const validation: ValidationResult = await validateConfiguration(config);

  if (!validation.valid) {
    return {
      success: false,
      targetDir: config.targetDir,
      filesGenerated: 0,
      warnings: validation.warnings,
      errors: validation.errors,
    };
  }

  await ensureDirectory(config.targetDir);

  // 1. Get Framework configuration
  let frameworkData;
  switch (config.framework) {
    case "next":
      frameworkData = await getNextConfig(config);
      break;
    case "cra":
      frameworkData = await getCraConfig(config);
      break;
    case "vite":
    default:
      frameworkData = await getViteConfig(config);
      break;
  }

  // 2. Resolve Integrations
  const integrationsData = await resolveIntegrations(config);

  // 3. Resolve Architecture Files (Enterprise modular structure)
  const architectureFiles = getFeatureArchitectureFiles(config);

  // 4. Combine all files
  const allFiles = [
    ...frameworkData.files,
    ...integrationsData.files,
    ...architectureFiles,
  ];

  // Write all files
  await writeProjectFiles(config.targetDir, allFiles);

  // 5. Merge package.json
  await mergePackageJson(config.targetDir, frameworkData.pkg);
  for (const update of integrationsData.pkgUpdates) {
    await mergePackageJson(config.targetDir, update);
  }

  // 6. Optional Git init
  if (config.initGit) {
    await initGitRepository(config.targetDir);
  }

  // 7. Optional Dependency installation
  if (config.installDeps) {
    await runInstall(config.targetDir, config.packageManager);
  }

  return {
    success: true,
    targetDir: config.targetDir,
    filesGenerated: allFiles.length + 1, // + package.json
    warnings: validation.warnings,
    errors: [],
  };
}
