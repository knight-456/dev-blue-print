import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getCraConfig(config: ProjectConfig): Promise<{
  pkg: Partial<PackageJsonConfig>;
  files: FileTreeItem[];
}> {
  const isTs = config.language === "typescript";

  const vOpts = {
    preset: config.preset,
    overrides: config.packageOverrides,
    fetchLatest: config.fetchLatest,
  };

  const reactVer = await getVersion("react", vOpts);
  const reactDomVer = await getVersion("react-dom", vOpts);
  const routerVer = await getVersion("react-router-dom", vOpts);
  const typesReactVer = await getVersion("@types/react", vOpts);
  const typesReactDomVer = await getVersion("@types/react-dom", vOpts);

  const pkg: Partial<PackageJsonConfig> = {
    name: config.projectName,
    scripts: {
      start: "react-scripts start",
      build: "react-scripts build",
      test: "react-scripts test",
      eject: "react-scripts eject",
    },
    dependencies: {
      react: reactVer,
      "react-dom": reactDomVer,
      "react-scripts": "5.0.1",
      "react-router-dom": routerVer,
      "web-vitals": "^4.2.4",
    },
    devDependencies: {
      ...(isTs
        ? {
            typescript: "^4.9.5",
            "@types/node": "^16.18.119",
            "@types/react": typesReactVer,
            "@types/react-dom": typesReactDomVer,
          }
        : {}),
    },
    browserslist: {
      production: [">0.2%", "not dead", "not op_mini all"],
      development: [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version",
      ],
    },
  };

  const files: FileTreeItem[] = [
    {
      path: "public/index.html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="DevBlueprint CRA Application" />
    <title>${config.projectName} - DevBlueprint</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,
    },
    {
      path: "public/manifest.json",
      content: JSON.stringify(
        {
          short_name: config.projectName,
          name: `${config.projectName} DevBlueprint`,
          start_url: ".",
          display: "standalone",
          theme_color: "#000000",
          background_color: "#ffffff",
        },
        null,
        2
      ),
    },
  ];

  if (isTs) {
    files.push({
      path: "tsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            target: "es5",
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            strict: true,
            forceConsistentCasingInFileNames: true,
            noFallthroughCasesInSwitch: true,
            module: "esnext",
            moduleResolution: "node",
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: "react-jsx",
            baseUrl: "src",
            paths: {
              "@/*": ["*"],
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
            baseUrl: "src",
            paths: {
              "@/*": ["*"],
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
