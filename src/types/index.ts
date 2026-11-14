export type Framework = "vite" | "next" | "cra";

export type Language = "typescript" | "javascript";

export type Architecture = "enterprise" | "modular" | "minimal";

export type VersionPreset = "enterprise" | "latest" | "stable";

export type ProjectFolder =
  | "apiInstance"
  | "interceptors"
  | "services"
  | "store"
  | "redux"
  | "provider"
  | "components"
  | "config"
  | "constants"
  | "hooks"
  | "utils";

export type Integration =
  | "redux"
  | "query"
  | "axios"
  | "tailwind"
  | "mui"
  | "shadcn"
  | "dayjs"
  | "forms"
  | "testing"
  | "cookies"
  | "toast"
  | "motion";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export interface ProjectConfig {
  projectName: string;
  targetDir: string;
  framework: Framework;
  language: Language;
  architecture: Architecture;
  folders: ProjectFolder[];
  integrations: Integration[];
  packageManager: PackageManager;
  installDeps: boolean;
  initGit: boolean;
  preset: VersionPreset;
  packageOverrides?: Record<string, string>;
  fetchLatest?: boolean;
}

export interface CLIOptions {
  name?: string;
  framework?: Framework;
  language?: Language;
  architecture?: Architecture;
  folders?: ProjectFolder[];
  integrations?: Integration[];
  packageManager?: PackageManager;
  install?: boolean;
  git?: boolean;
  yes?: boolean;
  preset?: VersionPreset;
  pkg?: string[];
  packageVersions?: string;
  fetchLatest?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PackageJsonConfig {
  name: string;
  version: string;
  private?: boolean;
  type?: "module" | "commonjs";
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  [key: string]: unknown;
}

export interface FileTreeItem {
  path: string;
  content: string;
}
