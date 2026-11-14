import { describe, it, expect } from "vitest";
import { validateProjectName } from "../src/validation/engine.js";
import { checkCompatibility } from "../src/validation/compatibility.js";
import type { ProjectConfig } from "../src/types/index.js";

describe("Validation Engine", () => {
  describe("validateProjectName", () => {
    it("accepts valid lowercase alphanumeric and hyphenated names", () => {
      expect(validateProjectName("my-app").valid).toBe(true);
      expect(validateProjectName("app123").valid).toBe(true);
      expect(validateProjectName("@scope/pkg-name").valid).toBe(true);
    });

    it("rejects invalid characters and leading symbols", () => {
      expect(validateProjectName("").valid).toBe(false);
      expect(validateProjectName(".invalid").valid).toBe(false);
      expect(validateProjectName("_invalid").valid).toBe(false);
      expect(validateProjectName("MyProject").valid).toBe(false);
      expect(validateProjectName("app with spaces").valid).toBe(false);
    });
  });

  describe("checkCompatibility", () => {
    it("automatically includes tailwind if shadcn is chosen without tailwind", () => {
      const config: ProjectConfig = {
        projectName: "test-app",
        targetDir: "./test-app",
        framework: "vite",
        language: "typescript",
        architecture: "feature",
        integrations: ["shadcn"],
        packageManager: "npm",
        installDeps: false,
        initGit: false,
      };

      const result = checkCompatibility(config);
      expect(config.integrations).toContain("tailwind");
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("warns about CRA legacy status", () => {
      const config: ProjectConfig = {
        projectName: "cra-app",
        targetDir: "./cra-app",
        framework: "cra",
        language: "javascript",
        architecture: "feature",
        integrations: ["redux"],
        packageManager: "npm",
        installDeps: false,
        initGit: false,
      };

      const result = checkCompatibility(config);
      expect(
        result.warnings.some((w) => w.includes("Create React App"))
      ).toBe(true);
    });
  });
});
