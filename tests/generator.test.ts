import { describe, it, expect, afterEach } from "vitest";
import path from "node:path";
import fs from "fs-extra";
import { generateProject } from "../src/generator/project-generator.js";
import { ALL_PROJECT_FOLDERS } from "../src/config/defaults.js";
import type { ProjectConfig } from "../src/types/index.js";

const TEST_DIR = path.resolve(process.cwd(), "temp-test-output");

describe("Project Generator Engine (Enterprise Architecture & Custom Folders)", () => {
  afterEach(async () => {
    if (await fs.pathExists(TEST_DIR)) {
      await fs.remove(TEST_DIR);
    }
  });

  it("scaffolds a complete Next.js 16 + React 19 project with full enterprise modules", async () => {
    const config: ProjectConfig = {
      projectName: "next-enterprise-test",
      targetDir: path.join(TEST_DIR, "next-enterprise-test"),
      framework: "next",
      language: "typescript",
      architecture: "enterprise",
      preset: "enterprise",
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
      ],
      packageManager: "npm",
      installDeps: false,
      initGit: false,
    };

    const result = await generateProject(config);
    expect(result.success).toBe(true);

    // Verify all modules
    expect(await fs.pathExists(path.join(config.targetDir, "src/apiInstance/axios.apiInstance.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/interceptors/axios.interceptor.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/services/auth/auth.service.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/services/dashboard/dashboard.service.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/store/index.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/store/root-reducer.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/redux/auth/authSlice.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/redux/local/localSlice.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/provider/index.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/provider/store.provider.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/components/loaders/full-page-loader.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/config/index.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/utils/local.cookies.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/app/layout.tsx"))).toBe(true);

    // Check package.json versions
    const pkg = await fs.readJson(path.join(config.targetDir, "package.json"));
    expect(pkg.dependencies.next).toBe("16.1.1");
    expect(pkg.dependencies.react).toBe("19.2.3");
    expect(pkg.dependencies["@reduxjs/toolkit"]).toBe("^2.11.2");
    expect(pkg.dependencies["@mui/material"]).toBe("^7.3.6");
    expect(pkg.devDependencies["tailwindcss"]).toBe("^4");
  });

  it("scaffolds only the selected folders when custom folders are chosen", async () => {
    const config: ProjectConfig = {
      projectName: "custom-folders-test",
      targetDir: path.join(TEST_DIR, "custom-folders-test"),
      framework: "vite",
      language: "typescript",
      architecture: "feature",
      preset: "enterprise",
      // ONLY include config and components, omitting redux, store, services, apiInstance
      folders: ["config", "components"],
      integrations: ["tailwind", "shadcn"],
      packageManager: "npm",
      installDeps: false,
      initGit: false,
    };

    const result = await generateProject(config);
    expect(result.success).toBe(true);

    // Selected folders should exist
    expect(await fs.pathExists(path.join(config.targetDir, "src/config/index.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/components/ui/button.tsx"))).toBe(true);

    // Omitted folders must NOT exist
    expect(await fs.pathExists(path.join(config.targetDir, "src/apiInstance"))).toBe(false);
    expect(await fs.pathExists(path.join(config.targetDir, "src/interceptors"))).toBe(false);
    expect(await fs.pathExists(path.join(config.targetDir, "src/services"))).toBe(false);
    expect(await fs.pathExists(path.join(config.targetDir, "src/store"))).toBe(false);
    expect(await fs.pathExists(path.join(config.targetDir, "src/redux"))).toBe(false);

    // package.json should not include unselected packages like @reduxjs/toolkit
    const pkg = await fs.readJson(path.join(config.targetDir, "package.json"));
    expect(pkg.dependencies["@reduxjs/toolkit"]).toBeUndefined();
  });
});
