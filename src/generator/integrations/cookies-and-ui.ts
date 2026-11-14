import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getCookiesAndUiIntegration(config: ProjectConfig): Promise<{
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

  const cookiesNextVer = await getVersion("cookies-next", vOpts);
  const toastVer = await getVersion("react-hot-toast", vOpts);
  const motionVer = await getVersion("framer-motion", vOpts);
  const spinnersVer = await getVersion("react-spinners", vOpts);

  const pkg: Partial<PackageJsonConfig> = {
    dependencies: {
      "cookies-next": cookiesNextVer,
      "react-hot-toast": toastVer,
      "framer-motion": motionVer,
      "react-spinners": spinnersVer,
    },
  };

  const cookiesContent = `import { setCookie as setCookieNext, getCookie as getCookieNext, deleteCookie } from 'cookies-next';

export const setCookie = (key${isTs ? ": string" : ""}, value${isTs ? ": any" : ""}, options${isTs ? ": any" : ""} = {}) => {
  setCookieNext(key, value, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
    ...options,
  });
};

export const getCookie = (key${isTs ? ": string" : ""}) => {
  return getCookieNext(key);
};

export const removeCookie = (key${isTs ? ": string" : ""}) => {
  deleteCookie(key);
};
`;

  const toastContent = `import toast from 'react-hot-toast';

export const notifySuccess = (message${isTs ? ": string" : ""}) => {
  toast.success(message, {
    duration: 3500,
    position: 'top-right',
  });
};

export const notifyError = (message${isTs ? ": string" : ""}) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
  });
};

export default toast;
`;

  const files: FileTreeItem[] = [
    {
      path: `src/utils/local.cookies.${ext}`,
      content: cookiesContent,
    },
    {
      path: `src/utils/toast.${ext}`,
      content: toastContent,
    },
  ];

  return { pkg, files };
}
