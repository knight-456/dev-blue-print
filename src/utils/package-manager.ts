import { promisify } from "node:util";
import { exec } from "node:child_process";
import type { PackageManager } from "../types/index.js";

const execAsync = promisify(exec);

export function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent;
  if (!userAgent) return "npm";

  if (userAgent.startsWith("pnpm")) return "pnpm";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("bun")) return "bun";
  return "npm";
}

export function getInstallCommand(pkgManager: PackageManager): string {
  switch (pkgManager) {
    case "yarn":
      return "yarn install";
    case "pnpm":
      return "pnpm install";
    case "bun":
      return "bun install";
    case "npm":
    default:
      return "npm install";
  }
}

export function getRunCommand(pkgManager: PackageManager, script: string): string {
  switch (pkgManager) {
    case "yarn":
      return `yarn ${script}`;
    case "pnpm":
      return `pnpm ${script}`;
    case "bun":
      return `bun run ${script}`;
    case "npm":
    default:
      return `npm run ${script}`;
  }
}

export async function runInstall(
  targetDir: string,
  pkgManager: PackageManager
): Promise<{ success: boolean; output: string }> {
  const command = getInstallCommand(pkgManager);
  try {
    const { stdout, stderr } = await execAsync(command, { cwd: targetDir });
    return { success: true, output: stdout || stderr };
  } catch (error: any) {
    return { success: false, output: error?.message || String(error) };
  }
}

export async function initGitRepository(targetDir: string): Promise<boolean> {
  try {
    await execAsync("git init", { cwd: targetDir });
    return true;
  } catch {
    return false;
  }
}
