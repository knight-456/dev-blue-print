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
        hint: "React 19, Next 16, Tailwind v4, Redux 2.11, Axios 1.13, MUI 7",
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
        label: "Full Enterprise Stack (All 12 Modules)",
        hint: "apiInstance, interceptors, services, store, redux, provider, components, etc.",
      },
      {
        value: "custom",
        label: "Custom Selection (Choose each folder individually)",
        hint: "Pick and choose only the specific folders & modules you want",
      },
    ],
  });

  if (p.isCancel(folderMode)) {
    p.cancel("Operation cancelled by user.");
    process.exit(0);
  }

  let selectedFolders: ProjectFolder[] = [...ALL_PROJECT_FOLDERS];

  if (folderMode === "custom") {
    const customFolders = await p.multiselect<
      { value: ProjectFolder; label: string; hint?: string }[],
      ProjectFolder
    >({
      message: "Select which folders to include in your project:",
      initialValues: [...ALL_PROJECT_FOLDERS],
      options: [
        {
          value: "apiInstance",
          label: "src/apiInstance/",
          hint: "Centralized Axios instances (baseApiInstance, baseCredApiInstance)",
        },
        {
          value: "interceptors",
          label: "src/interceptors/",
          hint: "JWT Bearer injection & token refresh queue",
        },
        {
          value: "services",
          label: "src/services/",
          hint: "Domain services (AuthService, DashboardService, constants)",
        },
        {
          value: "store",
          label: "src/store/",
          hint: "Redux Toolkit root store & root-reducer",
        },
        {
          value: "redux",
          label: "src/redux/",
          hint: "Redux slices (authSlice, localSlice)",
        },
        {
          value: "provider",
          label: "src/provider/",
          hint: "Master Provider, StoreProvider, LayoutProvider, NavbarProvider",
        },
        {
          value: "components",
          label: "src/components/",
          hint: "UI primitives & FullPageLoader",
        },
        {
          value: "config",
          label: "src/config/",
          hint: "API endpoints & environment detection",
        },
        {
          value: "constants",
          label: "src/constants/",
          hint: "Route paths, user roles & cookie keys",
        },
        {
          value: "hooks",
          label: "src/hooks/",
          hint: "Custom hooks (useAuth, useLocalStorage)",
        },
        {
          value: "utils",
          label: "src/utils/",
          hint: "Cookie helpers (cookies-next), toast, utils.data, Day.js",
        },
        {
          value: "layouts",
          label: "src/layouts/",
          hint: "MainLayout with header & collapsible sidebar",
        },
      ],
      required: false,
    });

    if (p.isCancel(customFolders)) {
      p.cancel("Operation cancelled by user.");
      process.exit(0);
    }

    selectedFolders = customFolders as ProjectFolder[];
  }

  // 6. Integrations
  const integrations = await p.multiselect<
    { value: Integration; label: string; hint?: string }[],
    Integration
  >({
    message: "Select integrations to include:",
    initialValues: [
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
    ],
    options: [
      {
        value: "redux",
        label: "Redux Toolkit",
        hint: "Predictable client-side state slices",
      },
      {
        value: "query",
        label: "TanStack React Query",
        hint: "QueryClient provider, cache, and custom query hooks",
      },
      {
        value: "axios",
        label: "Axios Client",
        hint: "HTTP client with auth interceptors",
      },
      {
        value: "tailwind",
        label: "Tailwind CSS (v4 PostCSS)",
        hint: "CSS variables, @import tailwindcss, theme tokens",
      },
      {
        value: "mui",
        label: "Material UI (MUI v7)",
        hint: "MUI ThemeProvider, CssBaseline, icons & date pickers",
      },
      {
        value: "shadcn",
        label: "shadcn/ui",
        hint: "components.json, cn utility, Radix-based Button",
      },
      {
        value: "dayjs",
        label: "Day.js",
        hint: "Relative time, UTC, timezone, formatting helpers",
      },
      {
        value: "forms",
        label: "React Hook Form + Zod",
        hint: "High-performance schema validation & LoginForm",
      },
      {
        value: "cookies",
        label: "Cookies & Toast",
        hint: "cookies-next, react-hot-toast, auth cookies helper",
      },
      {
        value: "testing",
        label: "Vitest / Jest + RTL",
        hint: "Unit & component testing setup",
      },
    ],
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
    architecture: folderMode === "all" ? "enterprise" : "feature",
    preset: preset as VersionPreset,
    folders: selectedFolders,
    integrations: integrations as Integration[],
    packageManager: packageManager as PackageManager,
    installDeps: installDeps as boolean,
    initGit: true,
  };
}
