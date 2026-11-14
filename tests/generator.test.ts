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

  it("scaffolds a complete Next.js 16 + React 19 project matching enterprise standards", async () => {
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

    // Verify Point 3: pages-info.utils.ts
    expect(await fs.pathExists(path.join(config.targetDir, "src/utils/pages-info.utils.ts"))).toBe(true);

    // Verify Point 4 & 6: features and layouts folders are eliminated
    expect(await fs.pathExists(path.join(config.targetDir, "src/features"))).toBe(false);
    expect(await fs.pathExists(path.join(config.targetDir, "src/layouts"))).toBe(false);

    // Verify Point 5: useDebounce and useStore.hooks exist
    expect(await fs.pathExists(path.join(config.targetDir, "src/hooks/useDebounce.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/hooks/useStore.hooks.ts"))).toBe(true);

    // Verify Point 7: provider files have .provider. before extension
    expect(await fs.pathExists(path.join(config.targetDir, "src/provider/store.provider.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/provider/layout.provider.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/provider/navbar.provider.tsx"))).toBe(true);

    // Verify Point 8: Redux modules have const.ts, state.ts, slice.ts
    expect(await fs.pathExists(path.join(config.targetDir, "src/redux/local/const.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/redux/local/state.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/redux/local/slice.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/redux/auth/slice.ts"))).toBe(true);

    // Verify Point 9: Services modules have .types.ts
    expect(await fs.pathExists(path.join(config.targetDir, "src/services/auth/auth.service.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/services/auth/auth.const.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/services/auth/auth.types.ts"))).toBe(true);

    // Verify Point 10: store/rootReducer.ts with pageReducers and globalReducers, and NO vitest.config.ts in Next.js
    expect(await fs.pathExists(path.join(config.targetDir, "src/store/rootReducer.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "vitest.config.ts"))).toBe(false);

    // Verify Point 2: Emotion and MUI peer versions
    const pkg = await fs.readJson(path.join(config.targetDir, "package.json"));
    expect(pkg.dependencies.next).toBe("^16.4.6");
    expect(pkg.dependencies.react).toBe("19.2.3");
    expect(pkg.dependencies["@emotion/react"]).toBe("^11.14.0");
    expect(pkg.dependencies["@emotion/styled"]).toBe("^11.14.0");
    expect(pkg.dependencies["@reduxjs/toolkit"]).toBe("^2.11.2");
  });

  it("scaffolds a Vite project with vitest.config.ts and selective folders", async () => {
    const config: ProjectConfig = {
      projectName: "vite-enterprise-test",
      targetDir: path.join(TEST_DIR, "vite-enterprise-test"),
      framework: "vite",
      language: "typescript",
      architecture: "enterprise",
      preset: "enterprise",
      folders: ["config", "components", "utils", "hooks"],
      integrations: ["tailwind", "testing", "shadcn"],
      packageManager: "pnpm",
      installDeps: false,
      initGit: false,
    };

    const result = await generateProject(config);
    expect(result.success).toBe(true);

    // In Vite with testing: vitest.config.ts MUST exist
    expect(await fs.pathExists(path.join(config.targetDir, "vitest.config.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/config/index.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(config.targetDir, "src/components/dashboard/dashboard-view.tsx"))).toBe(true);

    // Omitted folders must not exist
    expect(await fs.pathExists(path.join(config.targetDir, "src/apiInstance"))).toBe(false);
    expect(await fs.pathExists(path.join(config.targetDir, "src/store"))).toBe(false);
  });
});
