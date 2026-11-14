import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getAxiosIntegration(config: ProjectConfig): Promise<{
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

  const axiosVer = await getVersion("axios", vOpts);

  const pkg: Partial<PackageJsonConfig> = {
    dependencies: {
      axios: axiosVer,
    },
  };

  const apiInstanceContent = `import axios${isTs ? ", { AxiosInstance }" : ""} from 'axios';
import { axiosAuthInterceptor } from '@/interceptors/axios.interceptor';
import { API_BASE_URL, API_AUTH_BASE_URL } from '@/config';

export const baseApiInstance = ()${isTs ? ": AxiosInstance" : ""} => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  return instance;
};

export const baseAuthApiInstance = ()${isTs ? ": AxiosInstance" : ""} => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  axiosAuthInterceptor(instance);
  return instance;
};

export const baseLoginApiInstance = ()${isTs ? ": AxiosInstance" : ""} => {
  const instance = axios.create({
    baseURL: API_AUTH_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return instance;
};

export const baseCredApiInstance = ()${isTs ? ": AxiosInstance" : ""} => {
  const instance = axios.create({
    baseURL: API_AUTH_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  axiosAuthInterceptor(instance);
  return instance;
};

export default baseApiInstance;
`;

  const interceptorContent = `import ${isTs ? "type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';" : "'axios';"}
import { baseCredApiInstance } from '@/apiInstance/axios.apiInstance';
import { getCookie, setCookie, removeCookie } from '@/utils/local.cookies';

let isRefreshing = false;
let subscribers${isTs ? ": Array<(token: string) => void>" : ""} = [];

const onTokenRefreshed = (token${isTs ? ": string" : ""}) => {
  subscribers.forEach((callback) => callback(token));
  subscribers = [];
};

const addSubscriber = (callback${isTs ? ": (token: string) => void" : ""}) => {
  subscribers.push(callback);
};

export const refreshToken = async () => {
  try {
    const response = await baseCredApiInstance().post('/auth/refresh', {});
    const newToken = response?.data?.token;
    if (newToken) {
      setCookie('access_token', newToken);
    }
    return newToken;
  } catch (error) {
    removeCookie('access_token');
    throw error;
  }
};

export const requestInterceptor = async (config${isTs ? ": InternalAxiosRequestConfig" : ": any"}) => {
  if (config.headers && !config.headers.Authorization) {
    const token = getCookie('access_token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
  }
  return config;
};

export const responseInterceptor = (instance${isTs ? ": AxiosInstance" : ": any"}) => {
  return async (error${isTs ? ": AxiosError" : ": any"}) => {
    const { config, response } = error;
    const originalRequest = config${isTs ? " as InternalAxiosRequestConfig & { _retry?: boolean }" : ""};

    if (response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((token${isTs ? ": string" : ""}) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = \`Bearer \${token}\`;
            }
            resolve(instance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        isRefreshing = false;
        onTokenRefreshed(newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = \`Bearer \${newToken}\`;
        }
        return instance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        subscribers = [];
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  };
};

export const axiosAuthInterceptor = (instance${isTs ? ": AxiosInstance" : ": any"}) => {
  instance.interceptors.request.use(requestInterceptor, (err) => Promise.reject(err));
  instance.interceptors.response.use(
    (response) => response,
    responseInterceptor(instance)
  );
};
`;

  const files: FileTreeItem[] = [
    {
      path: `src/apiInstance/axios.apiInstance.${ext}`,
      content: apiInstanceContent,
    },
    {
      path: `src/interceptors/axios.interceptor.${ext}`,
      content: interceptorContent,
    },
  ];

  return { pkg, files };
}
