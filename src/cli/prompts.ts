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
        value: "vite",
        label: "Vite + React (Recommended)",
        hint: "Fast HMR, ESM bundling, React Router DOM",
      },
      {
        value: "next",
        label: "Next.js (App Router)",
        hint: "Fullstack SSR/SSG with Next 16 Turbopack",
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
        initialValue: false,
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

  // 6. Integrations (Only show relevant integrations based on selected folders)
  const availableIntegrations: { value: Integration; label: string; hint?: string }[] = [];

  if (selectedFolders.includes("store") || selectedFolders.includes("redux")) {
    availableIntegrations.push({
      value: "redux",
      label: "Redux Toolkit",
      hint: "Predictable client-side state slices",
    });
  }

  if (selectedFolders.includes("provider")) {
    availableIntegrations.push({
      value: "query",
      label: "TanStack React Query",
      hint: "QueryClient provider, cache, and custom query hooks",
    });
  }

  if (selectedFolders.includes("apiInstance") || selectedFolders.includes("services")) {
    availableIntegrations.push({
      value: "axios",
      label: "Axios Client",
      hint: "HTTP client with auth interceptors",
    });
  }

  availableIntegrations.push(
    {
      value: "tailwind",
      label: "Tailwind CSS (v4 PostCSS)",
      hint: "CSS variables, @import tailwindcss, theme tokens",
    },
    {
      value: "mui",
      label: "Material UI (MUI v6/v7)",
      hint: "MUI ThemeProvider, CssBaseline, icons & date pickers",
    }
  );

  if (selectedFolders.includes("components")) {
    availableIntegrations.push({
      value: "shadcn",
      label: "shadcn/ui",
      hint: "components.json, cn utility, Radix-based Button",
    });
  }

  if (selectedFolders.includes("utils")) {
    availableIntegrations.push(
      {
        value: "dayjs",
        label: "Day.js",
        hint: "Relative time, UTC, timezone, formatting helpers",
      },
      {
        value: "cookies",
        label: "Cookies & Toast",
        hint: "cookies-next, react-hot-toast, auth cookies helper",
      }
    );
  }

  availableIntegrations.push(
    {
      value: "forms",
      label: "React Hook Form + Zod",
      hint: "High-performance schema validation & LoginForm",
    },
    {
      value: "testing",
      label: "Testing Setup (Jest / Vitest + RTL)",
      hint: "Unit & component testing setup",
    }
  );

  const integrations = await p.multiselect<
    { value: Integration; label: string; hint?: string }[],
    Integration
  >({
    message: "Select integrations to include:",
    initialValues: availableIntegrations.map((i) => i.value),
    options: availableIntegrations,
    required: false,
  });

  if (p.isCancel(integrations)) {
    p.cancel("Operation cancelled by user.");
    process.exit(0);
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
    initialValue: false,
  });

  if (p.isCancel(installDeps)) {
    p.cancel("Operation cancelled by user.");
    process.exit(0);
  }

  return {
    projectName: projectName as string,
    targetDir: projectName as string,
    framework: framework as Framework,
    language: language as Language,
    architecture: folderMode === "all" ? "enterprise" : "modular",
    preset: preset as VersionPreset,
    folders: selectedFolders,
    integrations: integrations as Integration[],
    packageManager: packageManager as PackageManager,
    installDeps: installDeps as boolean,
    initGit: true,
  };
}
