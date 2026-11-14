import type { ProjectConfig, ValidationResult } from "../types/index.js";

export function checkCompatibility(config: ProjectConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. shadcn requires tailwind
  if (config.integrations.includes("shadcn") && !config.integrations.includes("tailwind")) {
    // Automatically rectify or warn
    warnings.push(
      "shadcn/ui requires Tailwind CSS. Automatically including 'tailwind' in integrations."
    );
    config.integrations.push("tailwind");
  }

  // 2. Both Tailwind and MUI selected
  if (config.integrations.includes("tailwind") && config.integrations.includes("mui")) {
    warnings.push(
      "Both Tailwind CSS and Material UI (MUI) selected. DevBlueprint sets up Emotion prefix and Scoped CSS ordering to prevent selector conflicts."
    );
  }

  // 3. CRA legacy notice
  if (config.framework === "cra") {
    warnings.push(
      "Create React App (CRA) is in maintenance mode. DevBlueprint configures react-scripts compatibility, but Vite or Next.js is recommended for modern web apps."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
