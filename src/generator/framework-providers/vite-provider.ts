import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getViteConfig(config: ProjectConfig): Promise<{
  pkg: Partial<PackageJsonConfig>;
  files: FileTreeItem[];
}> {
  const isTs = config.language === "typescript";
  const ext = isTs ? "tsx" : "jsx";
  const jsExt = isTs ? "ts" : "js";

  const vOpts = {
    preset: config.preset,
    overrides: config.packageOverrides,
    fetchLatest: config.fetchLatest,
  };

  const reactVer = await getVersion("react", vOpts);
  const reactDomVer = await getVersion("react-dom", vOpts);
  const routerVer = await getVersion("react-router-dom", vOpts);
  const viteVer = await getVersion("vite", vOpts);
  const viteReactPluginVer = await getVersion("@vitejs/plugin-react", vOpts);
  const tsVer = await getVersion("typescript", vOpts);
  const typesReactVer = await getVersion("@types/react", vOpts);
  const typesReactDomVer = await getVersion("@types/react-dom", vOpts);

  const pkg: Partial<PackageJsonConfig> = {
    name: config.projectName,
    type: "module",
    scripts: {
      dev: "vite",
      build: isTs ? "tsc && vite build" : "vite build",
      preview: "vite preview",
    },
    dependencies: {
      react: reactVer,
      "react-dom": reactDomVer,
      "react-router-dom": routerVer,
    },
    devDependencies: {
      "@vitejs/plugin-react": viteReactPluginVer,
      vite: viteVer,
      ...(isTs
        ? {
            typescript: tsVer,
            "@types/react": typesReactVer,
            "@types/react-dom": typesReactDomVer,
          }
        : {}),
    },
  };

  const files: FileTreeItem[] = [
    {
      path: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.projectName} - DevBlueprint</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${ext}"></script>
  </body>
</html>`,
    },
    {
      path: `vite.config.${jsExt}`,
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});`,
    },
  ];

  if (isTs) {
    files.push({
      path: "tsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            useDefineForClassFields: true,
            lib: ["ES2022", "DOM", "DOM.Iterable"],
            module: "ESNext",
            skipLibCheck: true,
            moduleResolution: "bundler",
            allowImportingTsExtensions: false,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: "react-jsx",
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true,
            baseUrl: ".",
            paths: {
              "@/*": ["./src/*"],
            },
          },
          include: ["src"],
        },
        null,
        2
      ),
    });
  } else {
    files.push({
      path: "jsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            baseUrl: ".",
            paths: {
              "@/*": ["./src/*"],
            },
            jsx: "react-jsx",
          },
          include: ["src"],
        },
        null,
        2
      ),
    });
  }

  return { pkg, files };
}
