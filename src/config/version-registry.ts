import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { VersionPreset } from "../types/index.js";

const execAsync = promisify(exec);

// Production enterprise versions
export const ENTERPRISE_VERSIONS: Record<string, string> = {
  // Core React & Next
  react: "19.2.3",
  "react-dom": "19.2.3",
  next: "16.1.1",
  "@types/react": "^19",
  "@types/react-dom": "^19",

  // Styling & PostCSS (Tailwind v4 stack)
  tailwindcss: "^4",
  "@tailwindcss/postcss": "^4",
  postcss: "^8.5.4",
  sass: "^1.96.0",

  // Material UI v7 & Emotion
  "@mui/material": "^7.3.6",
  "@mui/icons-material": "^7.3.6",
  "@mui/x-date-pickers": "^8.23.0",
  "@mui/x-data-grid": "^8.27.4",
  "@mui/x-charts": "^9.0.4",
  "@emotion/react": "^11.14.1",
  "@emotion/styled": "^11.14.1",

  // State & Data Fetching
  "@reduxjs/toolkit": "^2.11.2",
  "react-redux": "^9.2.0",
  "@tanstack/react-query": "^5.66.0",
  "@tanstack/react-query-devtools": "^5.66.0",
  axios: "^1.13.2",

  // Forms & Validation
  "react-hook-form": "^7.71.1",
  zod: "^4.3.6",
  "@hookform/resolvers": "^5.2.2",

  // Utilities, Cookies & Animation
  "cookies-next": "^6.1.1",
  dayjs: "^1.11.19",
  "react-hot-toast": "^2.6.0",
  "react-spinners": "^0.17.0",
  "framer-motion": "^12.33.0",
  "lucide-react": "^0.563.0",
  clsx: "^2.1.1",
  "tailwind-merge": "^3.4.0",
  hashids: "^2.3.0",
  recharts: "^3.7.0",

  // Routing & Bundling (Vite / CRA)
  "react-router-dom": "^7.1.5",
  vite: "^6.2.0",
  "@vitejs/plugin-react": "^4.3.4",
  vitest: "^3.0.5",
  typescript: "^5.7.3",
  "@types/node": "^22.13.4",
};

// Bleeding edge latest semantic versions
export const LATEST_VERSIONS: Record<string, string> = {
  ...ENTERPRISE_VERSIONS,
  react: "^19.0.0",
  "react-dom": "^19.0.0",
  next: "^16.0.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0",
  tailwindcss: "^4.0.0",
  "@tailwindcss/postcss": "^4.0.0",
  "react-router-dom": "^7.1.5",
  "@tanstack/react-query": "^5.66.0",
  "@reduxjs/toolkit": "^2.5.0",
  "react-redux": "^9.2.0",
  axios: "^1.8.0",
  dayjs: "^1.11.19",
  "react-hook-form": "^7.54.0",
  zod: "^3.24.0",
  "@hookform/resolvers": "^4.0.0",
  "lucide-react": "^0.475.0",
};

// Stable LTS fallback
export const STABLE_VERSIONS: Record<string, string> = {
  react: "^18.3.1",
  "react-dom": "^18.3.1",
  next: "^15.1.0",
  "@types/react": "^18.3.12",
  "@types/react-dom": "^18.3.1",
  tailwindcss: "^3.4.17",
  postcss: "^8.4.49",
  autoprefixer: "^10.4.20",
  "react-router-dom": "^6.28.0",
  "@reduxjs/toolkit": "^2.3.0",
  "react-redux": "^9.1.2",
  "@tanstack/react-query": "^5.59.20",
  axios: "^1.7.9",
  dayjs: "^1.11.13",
  "react-hook-form": "^7.53.2",
  zod: "^3.23.8",
  "@hookform/resolvers": "^3.9.1",
  "@mui/material": "^5.16.14",
  "@mui/icons-material": "^5.16.14",
  "@emotion/react": "^11.13.5",
  "@emotion/styled": "^11.13.5",
  "lucide-react": "^0.460.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.5.5",
  "vite": "^5.4.11",
  "@vitejs/plugin-react": "^4.3.4",
  vitest: "^2.1.8",
  typescript: "^5.6.3",
  "@types/node": "^22.8.7",
};

const liveVersionCache = new Map<string, string>();

/**
 * Fetch latest version directly from npm registry
 */
export async function fetchNpmLatestVersion(packageName: string): Promise<string | null> {
  if (liveVersionCache.has(packageName)) {
    return liveVersionCache.get(packageName)!;
  }
  try {
    const { stdout } = await execAsync(`npm view ${packageName} version`, { timeout: 4000 });
    const version = stdout.trim();
    if (version) {
      const semverStr = `^${version}`;
      liveVersionCache.set(packageName, semverStr);
      return semverStr;
    }
  } catch {
    // If offline or npm view fails, silently fallback to registry map
  }
  return null;
}

/**
 * Resolve package version considering overrides, preset, and dynamic live fetching
 */
export async function getVersion(
  packageName: string,
  options?: {
    preset?: VersionPreset;
    overrides?: Record<string, string>;
    fetchLatest?: boolean;
  }
): Promise<string> {
  const { preset = "enterprise", overrides = {}, fetchLatest = false } = options || {};

  // 1. Direct user override has highest priority
  if (overrides[packageName]) {
    return overrides[packageName];
  }

  // 2. Dynamic live query if requested
  if (fetchLatest) {
    const live = await fetchNpmLatestVersion(packageName);
    if (live) return live;
  }

  // 3. Preset selection
  let baseMap = ENTERPRISE_VERSIONS;
  if (preset === "latest") baseMap = LATEST_VERSIONS;
  if (preset === "stable") baseMap = STABLE_VERSIONS;

  if (baseMap[packageName]) {
    return baseMap[packageName];
  }

  return ENTERPRISE_VERSIONS[packageName] || LATEST_VERSIONS[packageName] || "latest";
}

/**
 * Bulk resolve package version records
 */
export async function resolveVersions(
  packageNames: string[],
  options?: {
    preset?: VersionPreset;
    overrides?: Record<string, string>;
    fetchLatest?: boolean;
  }
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const pkg of packageNames) {
    result[pkg] = await getVersion(pkg, options);
  }
  return result;
}
