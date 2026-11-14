import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getQueryIntegration(config: ProjectConfig): Promise<{
  pkg: Partial<PackageJsonConfig>;
  files: FileTreeItem[];
}> {
  const isTs = config.language === "typescript";
  const ext = isTs ? "ts" : "js";

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

  const clientContent = `import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
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

export default queryClient;
`;

  const sampleQueryContent = `import { useQuery } from '@tanstack/react-query';
import AuthService from '@/services/auth/auth.service';

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: () => AuthService.refreshToken({ body: {} }),
  });
};
`;

  const files: FileTreeItem[] = [
    {
      path: `src/provider/react-query.${ext}`,
      content: clientContent,
    },
    {
      path: `src/hooks/useCurrentUserProfile.${ext}`,
      content: sampleQueryContent,
    },
  ];

  return { pkg, files };
}
