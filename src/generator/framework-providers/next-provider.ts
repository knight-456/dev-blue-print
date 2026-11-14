import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getNextConfig(config: ProjectConfig): Promise<{
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

  const nextVer = await getVersion("next", vOpts);
  const reactVer = await getVersion("react", vOpts);
  const reactDomVer = await getVersion("react-dom", vOpts);
  const typesNodeVer = await getVersion("@types/node", vOpts);
  const typesReactVer = await getVersion("@types/react", vOpts);
  const typesReactDomVer = await getVersion("@types/react-dom", vOpts);
  const tsVer = await getVersion("typescript", vOpts);

  const pkg: Partial<PackageJsonConfig> = {
    name: config.projectName,
    scripts: {
      dev: "next dev --turbopack",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      next: nextVer,
      react: reactVer,
      "react-dom": reactDomVer,
    },
    devDependencies: {
      ...(isTs
        ? {
            typescript: tsVer,
            "@types/node": typesNodeVer,
            "@types/react": typesReactVer,
            "@types/react-dom": typesReactDomVer,
          }
        : {}),
    },
  };

  const files: FileTreeItem[] = [
    {
      path: isTs ? "next.config.ts" : "next.config.mjs",
      content: isTs
        ? `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;`
        : `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;`,
    },
  ];

  if (isTs) {
    files.push({
      path: "tsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            plugins: [
              {
                name: "next",
              },
            ],
            paths: {
              "@/*": ["./src/*"],
            },
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
          exclude: ["node_modules"],
        },
        null,
        2
      ),
    });
    files.push({
      path: "next-env.d.ts",
      content: '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/basic-features/typescript for more information.\n',
    });
  } else {
    files.push({
      path: "jsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            paths: {
              "@/*": ["./src/*"],
            },
            jsx: "preserve",
          },
          include: ["**/*.js", "**/*.jsx"],
        },
        null,
        2
      ),
    });
  }

  return { pkg, files };
}
