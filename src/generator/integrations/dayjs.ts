import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getDayjsIntegration(config: ProjectConfig): Promise<{
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

  const dayjsVer = await getVersion("dayjs", vOpts);

  const pkg: Partial<PackageJsonConfig> = {
    dependencies: {
      dayjs: dayjsVer,
    },
  };

  const dayjsContent = `import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

export const formatDate = (date${isTs ? ": string | Date | number" : ""}, format = 'LL')${isTs ? ": string" : ""} => {
  return dayjs(date).format(format);
};

export const formatFromNow = (date${isTs ? ": string | Date | number" : ""})${isTs ? ": string" : ""} => {
  return dayjs(date).fromNow();
};

export const getUtcTimestamp = (date${isTs ? "?: string | Date | number" : ""})${isTs ? ": string" : ""} => {
  return dayjs(date).utc().toISOString();
};

export default dayjs;
`;

  const files: FileTreeItem[] = [
    {
      path: `src/utils/dayjs.${ext}`,
      content: dayjsContent,
    },
  ];

  return { pkg, files };
}
