import { describe, it, expect } from "vitest";
import {
  getVersion,
  resolveVersions,
  ENTERPRISE_VERSIONS,
  STABLE_VERSIONS,
} from "../src/config/version-registry.js";

describe("Package Version Registry Engine", () => {
  it("resolves enterprise stack versions by default", async () => {
    const reactVer = await getVersion("react", { preset: "enterprise" });
    const nextVer = await getVersion("next", { preset: "enterprise" });
    const tailwindVer = await getVersion("tailwindcss", { preset: "enterprise" });

    expect(reactVer).toBe("19.2.3");
    expect(nextVer).toBe("^16.4.6");
    expect(tailwindVer).toBe("^4");
  });

  it("resolves stable LTS versions when stable preset is requested", async () => {
    const reactVer = await getVersion("react", { preset: "stable" });
    const tailwindVer = await getVersion("tailwindcss", { preset: "stable" });

    expect(reactVer).toBe(STABLE_VERSIONS.react);
    expect(tailwindVer).toBe(STABLE_VERSIONS.tailwindcss);
  });

  it("prioritizes custom user package overrides over presets", async () => {
    const customVer = await getVersion("react", {
      preset: "enterprise",
      overrides: { react: "19.3.0-custom" },
    });

    expect(customVer).toBe("19.3.0-custom");
  });

  it("bulk resolves package lists", async () => {
    const resolved = await resolveVersions(["react", "next", "axios"], {
      preset: "enterprise",
      overrides: { axios: "^1.9.9" },
    });

    expect(resolved.react).toBe("19.2.3");
    expect(resolved.next).toBe("^16.4.6");
    expect(resolved.axios).toBe("^1.9.9");
  });
});
