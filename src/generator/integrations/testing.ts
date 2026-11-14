import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getTestingIntegration(config: ProjectConfig): Promise<{
  pkg: Partial<PackageJsonConfig>;
  files: FileTreeItem[];
}> {
  const isTs = config.language === "typescript";
  const ext = isTs ? "ts" : "js";
  const compExt = isTs ? "tsx" : "jsx";

  const isCra = config.framework === "cra";

  const vOpts = {
    preset: config.preset,
    overrides: config.packageOverrides,
    fetchLatest: config.fetchLatest,
  };

  const vitestVer = await getVersion("vitest", vOpts);

  const pkg: Partial<PackageJsonConfig> = isCra
    ? {
        devDependencies: {
          "@testing-library/jest-dom": "^6.6.2",
          "@testing-library/react": "^16.1.0",
          "@testing-library/user-event": "^14.5.2",
        },
      }
    : {
        scripts: {
          test: "vitest run",
          "test:watch": "vitest",
          "test:coverage": "vitest run --coverage",
        },
        devDependencies: {
          vitest: vitestVer,
          "@testing-library/react": "^16.1.0",
          "@testing-library/jest-dom": "^6.6.2",
          "@testing-library/user-event": "^14.5.2",
          jsdom: "^25.0.1",
        },
      };

  const setupContent = `import '@testing-library/jest-dom';
`;

  const vitestConfigContent = `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.${ext}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`;

  const sampleTestContent = `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

const SampleHeading = () => <h1>Welcome to DevBlueprint</h1>;

describe('DevBlueprint Core App', () => {
  it('renders application header properly', () => {
    render(<SampleHeading />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Welcome to DevBlueprint'
    );
  });
});
`;

  const files: FileTreeItem[] = [
    {
      path: `src/tests/setup.${ext}`,
      content: setupContent,
    },
    {
      path: `src/tests/App.test.${compExt}`,
      content: sampleTestContent,
    },
  ];

  if (!isCra) {
    files.push({
      path: `vitest.config.${ext}`,
      content: vitestConfigContent,
    });
  }

  return { pkg, files };
}
