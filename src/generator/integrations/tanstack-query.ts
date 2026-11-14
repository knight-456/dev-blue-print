import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getQueryIntegration(config: ProjectConfig): Promise<{
  pkg: Partial<PackageJsonConfig>;
  files: FileTreeItem[];
}> {
  const isTs = config.language === "typescript";
  const ext = isTs ? "ts" : "js";
  const compExt = isTs ? "tsx" : "jsx";

  const vOpts = {
    preset: config.preset,
    overrides: config.packageOverrides,
    fetchLatest: config.fetchLatest,
  };

  const queryVer = await getVersion("@tanstack/react-query", vOpts);
  const devtoolsVer = await getVersion("@tanstack/react-query-devtools", vOpts);

  const pkg: Partial<PackageJsonConfig> = {
    dependencies: {
      "@tanstack/react-query": queryVer,
      "@tanstack/react-query-devtools": devtoolsVer,
    },
  };

  const queryProviderContent = `"use client";
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });

let browserQueryClient${isTs ? ": QueryClient | undefined" : ""};

export const getQueryClient = () => {
  if (typeof window === 'undefined') {
    return createQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
};

export const QueryProvider = ({ children }${isTs ? ": { children?: React.ReactNode }" : ""}) => {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;
`;

  const files: FileTreeItem[] = [
    {
      path: `src/provider/query.provider.${compExt}`,
      content: queryProviderContent,
    },
  ];

  return { pkg, files };
}
