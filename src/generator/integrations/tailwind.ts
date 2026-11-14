import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getTailwindIntegration(config: ProjectConfig): Promise<{
  pkg: Partial<PackageJsonConfig>;
  files: FileTreeItem[];
}> {
  const isTs = config.language === "typescript";
  const jsExt = isTs ? "ts" : "js";

  const vOpts = {
    preset: config.preset,
    overrides: config.packageOverrides,
    fetchLatest: config.fetchLatest,
  };

  const isV4 = config.preset === "enterprise" || config.preset === "latest";

  const tailwindVer = await getVersion("tailwindcss", vOpts);
  const tailwindPostcssVer = await getVersion("@tailwindcss/postcss", vOpts);
  const postcssVer = await getVersion("postcss", vOpts);

  const pkg: Partial<PackageJsonConfig> = isV4
    ? {
        devDependencies: {
          tailwindcss: tailwindVer,
          "@tailwindcss/postcss": tailwindPostcssVer,
          postcss: postcssVer,
        },
      }
    : {
        devDependencies: {
          tailwindcss: tailwindVer,
          postcss: postcssVer,
          autoprefixer: "^10.4.20",
        },
      };

  const postcssConfig = isV4
    ? `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`
    : `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

  const globalCss = isV4
    ? `@import "tailwindcss";

@layer base {
  :root {
    --background: #ffffff;
    --foreground: #0f172a;
    --primary: #2563eb;
    --primary-foreground: #ffffff;
    --card: #ffffff;
    --card-foreground: #0f172a;
    --border: #e2e8f0;
    --radius: 0.5rem;
  }

  .dark {
    --background: #090d16;
    --foreground: #f8fafc;
    --primary: #3b82f6;
    --primary-foreground: #ffffff;
    --card: #0f172a;
    --card-foreground: #f8fafc;
    --border: #1e293b;
  }
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-feature-settings: "rlig" 1, "calt" 1;
}
`
    : `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --border: 217.2 32.6% 17.5%;
  }
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
`;

  const files: FileTreeItem[] = [
    {
      path: `postcss.config.mjs`,
      content: postcssConfig,
    },
    {
      path: `src/globals.css`,
      content: globalCss,
    },
    {
      path: `src/theme.css`,
      content: `:root {
  --app-header-height: 64px;
  --app-sidebar-width: 260px;
  --color-primary-main: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-primary-light: #60a5fa;
  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-danger: #dc2626;
  --color-neutral-bg: #f8fafc;
}
`,
    },
  ];

  if (!isV4) {
    files.push({
      path: `tailwind.config.${jsExt}`,
      content: `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  plugins: [],
};`,
    });
  }

  return { pkg, files };
}
