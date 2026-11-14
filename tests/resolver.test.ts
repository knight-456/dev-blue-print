import { describe, it, expect } from "vitest";
import { resolveConfiguration } from "../src/config/resolver.js";

describe("Configuration Resolver", () => {
  it("resolves default configuration when no args are provided", () => {
    const config = resolveConfiguration({});
    expect(config.projectName).toBe("my-devblueprint-app");
    expect(config.framework).toBe("vite");
    expect(config.language).toBe("typescript");
    expect(config.architecture).toBe("enterprise");
    expect(config.folders.length).toBeGreaterThan(5);
    expect(config.integrations).toContain("redux");
    expect(config.integrations).toContain("query");
    expect(config.integrations).toContain("shadcn");
  });

  it("overrides defaults with provided CLI flags", () => {
    const config = resolveConfiguration({
      name: "custom-app",
      framework: "next",
      language: "javascript",
      folders: ["components", "config"],
      integrations: ["axios", "tailwind"],
    });

    expect(config.projectName).toBe("custom-app");
    expect(config.framework).toBe("next");
    expect(config.language).toBe("javascript");
    expect(config.folders).toEqual(["components", "config"]);
  });
});
