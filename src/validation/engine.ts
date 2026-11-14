import fs from "fs-extra";
import path from "node:path";
import type { ProjectConfig, ValidationResult } from "../types/index.js";
import { checkCompatibility } from "./compatibility.js";

const NPM_NAME_REGEX = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

export function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Project name cannot be empty." };
  }

  const trimmed = name.trim();
  if (trimmed.length > 214) {
    return { valid: false, error: "Project name must be 214 characters or fewer." };
  }

  if (trimmed.startsWith(".") || trimmed.startsWith("_")) {
    return { valid: false, error: "Project name cannot start with a dot or underscore." };
  }

  if (!NPM_NAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: "Project name must contain only lowercase alphanumeric characters, hyphens, and underscores.",
    };
  }

  return { valid: true };
}

export async function validateTargetDirectory(
  targetDir: string
): Promise<{ valid: boolean; warning?: string }> {
  if (await fs.pathExists(targetDir)) {
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      return {
        valid: true,
        warning: `Target directory "${path.basename(targetDir)}" is not empty. Files may be overwritten.`,
      };
    }
  }
  return { valid: true };
}

export async function validateConfiguration(
  config: ProjectConfig
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const nameVal = validateProjectName(config.projectName);
  if (!nameVal.valid && nameVal.error) {
    errors.push(nameVal.error);
  }

  const dirVal = await validateTargetDirectory(config.targetDir);
  if (dirVal.warning) {
    warnings.push(dirVal.warning);
  }

  const compatVal = checkCompatibility(config);
  errors.push(...compatVal.errors);
  warnings.push(...compatVal.warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
