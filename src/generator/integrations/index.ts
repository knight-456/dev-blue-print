import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getReduxIntegration } from "./redux.js";
import { getQueryIntegration } from "./tanstack-query.js";
import { getAxiosIntegration } from "./axios.js";
import { getTailwindIntegration } from "./tailwind.js";
import { getMuiIntegration } from "./mui.js";
import { getShadcnIntegration } from "./shadcn.js";
import { getDayjsIntegration } from "./dayjs.js";
import { getFormsIntegration } from "./forms.js";
import { getTestingIntegration } from "./testing.js";
import { getCookiesAndUiIntegration } from "./cookies-and-ui.js";

export async function resolveIntegrations(config: ProjectConfig): Promise<{
  pkgUpdates: Partial<PackageJsonConfig>[];
  files: FileTreeItem[];
}> {
  const pkgUpdates: Partial<PackageJsonConfig>[] = [];
  const files: FileTreeItem[] = [];

  const folders = config.folders || [];
  const hasFolder = (name: string) => folders.length === 0 || folders.includes(name as any);

  for (const integration of config.integrations) {
    switch (integration) {
      case "redux": {
        if (hasFolder("store") || hasFolder("redux")) {
          const res = await getReduxIntegration(config);
          pkgUpdates.push(res.pkg);
          const filteredFiles = res.files.filter((f) => {
            if (f.path.includes("src/store/") && !hasFolder("store")) return false;
            if (f.path.includes("src/redux/") && !hasFolder("redux")) return false;
            return true;
          });
          files.push(...filteredFiles);
        }
        break;
      }
      case "query": {
        const res = await getQueryIntegration(config);
        pkgUpdates.push(res.pkg);
        const filteredFiles = res.files.filter((f) => {
          if (f.path.includes("src/provider/") && !hasFolder("provider")) return false;
          if (f.path.includes("src/hooks/") && !hasFolder("hooks")) return false;
          return true;
        });
        files.push(...filteredFiles);
        break;
      }
      case "axios": {
        if (hasFolder("apiInstance") || hasFolder("interceptors") || hasFolder("services")) {
          const res = await getAxiosIntegration(config);
          pkgUpdates.push(res.pkg);
          const filteredFiles = res.files.filter((f) => {
            if (f.path.includes("src/apiInstance/") && !hasFolder("apiInstance")) return false;
            if (f.path.includes("src/interceptors/") && !hasFolder("interceptors")) return false;
            return true;
          });
          files.push(...filteredFiles);
        }
        break;
      }
      case "tailwind": {
        const res = await getTailwindIntegration(config);
        pkgUpdates.push(res.pkg);
        files.push(...res.files);
        break;
      }
      case "mui": {
        const res = await getMuiIntegration(config);
        pkgUpdates.push(res.pkg);
        files.push(...res.files);
        break;
      }
      case "shadcn": {
        if (hasFolder("components")) {
          const res = await getShadcnIntegration(config);
          pkgUpdates.push(res.pkg);
          files.push(...res.files);
        }
        break;
      }
      case "dayjs": {
        if (hasFolder("utils")) {
          const res = await getDayjsIntegration(config);
          pkgUpdates.push(res.pkg);
          files.push(...res.files);
        }
        break;
      }
      case "forms": {
        const res = await getFormsIntegration(config);
        pkgUpdates.push(res.pkg);
        files.push(...res.files);
        break;
      }
      case "testing": {
        const res = await getTestingIntegration(config);
        pkgUpdates.push(res.pkg);
        files.push(...res.files);
        break;
      }
      case "cookies":
      case "toast":
      case "motion": {
        if (hasFolder("utils")) {
          const alreadyAdded = pkgUpdates.some((p) => p.dependencies?.["cookies-next"]);
          if (!alreadyAdded) {
            const res = await getCookiesAndUiIntegration(config);
            pkgUpdates.push(res.pkg);
            files.push(...res.files);
          }
        }
        break;
      }
    }
  }

  return { pkgUpdates, files };
}
