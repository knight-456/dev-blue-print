import * as p from "@clack/prompts";
import pc from "picocolors";
import type {
  Framework,
  Language,
  Integration,
  PackageManager,
  ProjectConfig,
  ProjectFolder,
  VersionPreset,
} from "../types/index.js";
import { validateProjectName } from "../validation/engine.js";
import { ALL_PROJECT_FOLDERS } from "../config/defaults.js";

const FOLDER_DEFINITIONS: { folder: ProjectFolder; label: string; hint: string }[] = [
  {
    folder: "apiInstance",
    label: "src/apiInstance/",
    hint: "Centralized Axios instances (baseApiInstance, baseCredApiInstance)",
  },
  {
    folder: "interceptors",
    label: "src/interceptors/",
    hint: "JWT Bearer injection & token refresh queue",
  },
  {
    folder: "services",
    label: "src/services/",
    hint: "Domain services (auth.service, auth.const, auth.types, dashboard)",
  },
  {
    folder: "store",
    label: "src/store/",
    hint: "Redux Toolkit root store & rootReducer",
  },
  {
    folder: "redux",
    label: "src/redux/",
    hint: "Redux slices with const.ts, state.ts, slice.ts per module",
  },
  {
    folder: "provider",
    label: "src/provider/",
    hint: "store.provider, layout.provider, navbar.provider, modal.provider",
  },
  {
    folder: "components",
    label: "src/components/",
    hint: "UI primitives, dashboard-view & FullPageLoader",
  },
  {
    folder: "config",
    label: "src/config/",
    hint: "API endpoints & environment detection",
  },
  {
    folder: "constants",
    label: "src/constants/",
    hint: "App constants & storage keys",
  },
  {
    folder: "hooks",
    label: "src/hooks/",
    hint: "useDebounce, useStore.hooks, useLocalStorage",
  },
  {
    folder: "utils",
    label: "src/utils/",
    hint: "pages-info.utils (route regexes), local.cookies, Day.js",
  },
];

export async function runInteractivePrompts(
  initialName?: string
): Promise<Partial<ProjectConfig>> {
  p.intro(pc.bgCyan(pc.black(" DevBlueprint CLI Setup ")));

  // 1. Project Name
  const projectName = await p.text({
    message: "What is your project name?",
    placeholder: "my-devblueprint-app",
    initialValue: initialName || "my-devblueprint-app",
    validate(value) {
      const result = validateProjectName(value);
      if (!result.valid) return result.error;
    },
  });

  if (p.isCancel(projectName)) {
    p.cancel("Operation cancelled by user.");
    process.exit(0);
  }

  // 2. Framework
  const framework = await p.select<
    { value: Framework; label: string; hint?: string }[],
    Framework
  >({
    message: "Select your framework:",
    initialValue: "vite",
    options: [
      {
        value: "next",
        label: "Next.js (App Router) (Recommended)",
        hint: "Fullstack SSR/SSG with Next 16 Turbopack",
      },
      {
        value: "next",
        label: "Next.js (Pages Router)",
        hint: "Fullstack SSR/SSG with Next 16 Turbopack",
      },
      {
        value: "vite",
        label: "Vite + React",
        hint: "Fast HMR, ESM bundling, React Router DOM",
      },
      {
        value: "cra",
        label: "Create React App (CRA Legacy)",
        hint: "Webpack react-scripts setup",
      },
    ],
  });

  if (p.isCancel(framework)) {
    p.cancel("Operation cancelled by user.");
    process.exit(0);
  }

  // 2b. Next.js Router (App Router vs Pages Router)
  let nextRouter: "app" | "pages" = "app";
  if (framework === "next") {
    const routerChoice = await p.select<
      { value: "app" | "pages"; label: string; hint?: string }[],
      "app" | "pages"
    >({
      message: "Select Next.js Router:",
      initialValue: "app",
      options: [
        {
          value: "app",
          label: "App Router (Recommended)",
          hint: "Modern React Server Components, app/ layout and page files",
        },
        {
          value: "pages",
          label: "Pages Router",
          hint: "Traditional Next.js file-system routing with pages/ _app, _document",
        },
      ],
    });

    if (p.isCancel(routerChoice)) {
      p.cancel("Operation cancelled by user.");
      process.exit(0);
    }
    nextRouter = routerChoice;
  }

  // 3. Language
  const language = await p.select<
    { value: Language; label: string; hint?: string }[],
    Language
  >({
    message: "Select language:",
    initialValue: "typescript",
    options: [
      {
        value: "typescript",
        label: "TypeScript",
        hint: "Strict types, interfaces, best DX",
      },
      {
        value: "javascript",
        label: "JavaScript",
        hint: "Standard ESNext without static typing",
      },
    ],
  });

  if (p.isCancel(language)) {
    p.cancel("Operation cancelled by user.");
    process.exit(0);
  }

  // 4. Version Preset
  const preset = await p.select<
    { value: VersionPreset; label: string; hint?: string }[],
    VersionPreset
  >({
    message: "Select package version preset:",
    initialValue: "enterprise",
    options: [
      {
        value: "enterprise",
        label: "Enterprise Stack (Recommended)",
        hint: "React 19, Next 16, Tailwind v4, Redux 2.11, Axios 1.13, MUI 6/7",
      },
      {
        value: "latest",
        label: "Bleeding Edge Latest",
        hint: "Resolves latest semantic versions across all libraries",
      },
      {
        value: "stable",
        label: "Stable LTS",
        hint: "React 18.3, Next 15, Tailwind v3, proven stable LTS",
      },
    ],
  });

  if (p.isCancel(preset)) {
    p.cancel("Operation cancelled by user.");
    process.exit(0);
  }

  // 5. Folder Structure Selection Mode
  const folderMode = await p.select<
    { value: "all" | "custom"; label: string; hint?: string }[],
    "all" | "custom"
  >({
    message: "Folder structure configuration:",
    initialValue: "all",
    options: [
      {
        value: "all",
        label: `Full Enterprise Stack (${ALL_PROJECT_FOLDERS.length} Modules)`,
        hint: "apiInstance, interceptors, services, store, redux, provider, components, etc.",
      },
      {
        value: "custom",
        label: "Custom Selection (Ask for each folder individually)",
        hint: "Prompts you one by one for each folder so you only get what you need",
      },
    ],
  });

  if (p.isCancel(folderMode)) {
    p.cancel("Operation cancelled by user.");
    process.exit(0);
  }

  let selectedFolders: ProjectFolder[] = [];

  if (folderMode === "all") {
    selectedFolders = [...ALL_PROJECT_FOLDERS];
  } else {
    p.log.step(pc.cyan("Configure each folder individually:"));
    for (const item of FOLDER_DEFINITIONS) {
      const include = await p.confirm({
        message: `Include ${pc.bold(item.label)} - ${pc.dim(item.hint)}?`,
        initialValue: true,
      });

      if (p.isCancel(include)) {
        p.cancel("Operation cancelled by user.");
        process.exit(0);
      }

      if (include) {
        selectedFolders.push(item.folder);
      }
    }
  }

  // 6. Integrations Selection
  const selectedIntegrations: Integration[] = [];

  // Libraries automatically included because of dependent folders selected in step 5:
  const autoIncluded: { integration: Integration; name: string; reason: string }[] = [];

  // Redux: strictly required when store or redux folder is selected
  if (selectedFolders.includes("store") || selectedFolders.includes("redux")) {
    autoIncluded.push({
      integration: "redux",
      name: "Redux Toolkit",
      reason: "required by src/store and/or src/redux",
    });
  }

  // Axios: strictly required when apiInstance, interceptors, or services folder is selected
  if (
    selectedFolders.includes("apiInstance") ||
    selectedFolders.includes("interceptors") ||
    selectedFolders.includes("services")
  ) {
    autoIncluded.push({
      integration: "axios",
      name: "Axios Client",
      reason: "required by src/apiInstance, src/interceptors, and/or src/services",
    });
  }

  // Auto-add dependent integrations without asking
  for (const item of autoIncluded) {
    selectedIntegrations.push(item.integration);
  }

  if (autoIncluded.length > 0) {
    p.log.info(
      pc.green("Auto-included libraries based on selected folders:\n") +
        autoIncluded
          .map((item) => `  ${pc.bold("✓")} ${pc.cyan(item.name)} ${pc.dim(`(${item.reason})`)}`)
          .join("\n")
    );
  }

  // Candidate libraries to ask individually
  const candidateIntegrations: {
    integration: Integration;
    label: string;
    hint: string;
    allowed: boolean;
  }[] = [
    {
      integration: "query",
      label: "TanStack React Query",
      hint: "QueryClient provider, cache, and custom query hooks",
      allowed: selectedFolders.includes("provider") || folderMode === "all",
    },
    {
      integration: "tailwind",
      label: "Tailwind CSS (v4 PostCSS)",
      hint: "CSS variables, @import tailwindcss, theme tokens",
      allowed: true,
    },
    {
      integration: "mui",
      label: "Material UI (MUI v6/v7)",
      hint: "MUI ThemeProvider, CssBaseline, icons & date pickers",
      allowed: true,
    },
    {
      integration: "shadcn",
      label: "shadcn/ui",
      hint: "components.json, cn utility, Radix-based Button",
      allowed: selectedFolders.includes("components") || folderMode === "all",
    },
    {
      integration: "dayjs",
      label: "Day.js",
      hint: "Relative time, UTC, timezone, formatting helpers",
      allowed: selectedFolders.includes("utils") || folderMode === "all",
    },
    {
      integration: "cookies",
      label: "Cookies & Toast",
      hint: "cookies-next, react-hot-toast, auth cookies helper",
      allowed: selectedFolders.includes("utils") || folderMode === "all",
    },
    {
      integration: "forms",
      label: "React Hook Form + Zod",
      hint: "High-performance schema validation & LoginForm",
      allowed: true,
    },
    {
      integration: "testing",
      label: "Testing Setup (Jest / Vitest + RTL)",
      hint: "Unit & component testing setup",
      allowed: true,
    },
  ];

  p.log.step(pc.cyan("Configure additional libraries individually:"));
  for (const item of candidateIntegrations) {
    // If already included via folder dependency, do not ask
    if (selectedIntegrations.includes(item.integration)) {
      continue;
    }

    // If prerequisite folder is missing, skip
    if (!item.allowed) {
      continue;
    }

    const include = await p.confirm({
      message: `Include ${pc.bold(item.label)} - ${pc.dim(item.hint)}?`,
      initialValue: true,
    });

    if (p.isCancel(include)) {
      p.cancel("Operation cancelled by user.");
      process.exit(0);
    }

    if (include) {
      selectedIntegrations.push(item.integration);
    }
  }

  // 7. Package Manager
  const packageManager = await p.select<
    { value: PackageManager; label: string }[],
    PackageManager
  >({
    message: "Select package manager:",
    initialValue: "npm",
    options: [
      { value: "npm", label: "npm" },
      { value: "pnpm", label: "pnpm" },
      { value: "yarn", label: "yarn" },
      { value: "bun", label: "bun" },
    ],
  });

  if (p.isCancel(packageManager)) {
    p.cancel("Operation cancelled by user.");
    process.exit(0);
  }

  // 8. Install dependencies now?
  const installDeps = await p.confirm({
    message: "Install dependencies now?",
    initialValue: true,
  });

  if (p.isCancel(installDeps)) {
    p.cancel("Operation cancelled by user.");
    process.exit(0);
  }

  return {
    projectName: projectName as string,
    targetDir: projectName as string,
    framework: framework as Framework,
    nextRouter: nextRouter,
    language: language as Language,
    architecture: folderMode === "all" ? "enterprise" : "modular",
    preset: preset as VersionPreset,
    folders: selectedFolders,
    integrations: selectedIntegrations as Integration[],
    packageManager: packageManager as PackageManager,
    installDeps: installDeps as boolean,
    initGit: true,
  };
}
