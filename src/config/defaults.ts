import type { ProjectConfig, ProjectFolder } from "../types/index.js";

export const ALL_PROJECT_FOLDERS: ProjectFolder[] = [
  "apiInstance",
  "interceptors",
  "services",
  "store",
  "redux",
  "provider",
  "components",
  "config",
  "constants",
  "hooks",
  "utils",
];

export const DEFAULT_CONFIG: ProjectConfig = {
  projectName: "my-devblueprint-app",
  targetDir: "./my-devblueprint-app",
  framework: "vite",
  language: "typescript",
  architecture: "enterprise",
  folders: [...ALL_PROJECT_FOLDERS],
  integrations: [
    "redux",
    "query",
    "axios",
    "tailwind",
    "mui",
    "dayjs",
    "testing",
    "forms",
    "shadcn",
    "cookies",
    "toast",
    "motion",
  ],
  packageManager: "npm",
  installDeps: false,
  initGit: true,
  preset: "enterprise",
  packageOverrides: {},
  fetchLatest: false,
};
