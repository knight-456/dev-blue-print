import type { FileTreeItem, ProjectConfig } from "../../types/index.js";

export function getFeatureArchitectureFiles(config: ProjectConfig): FileTreeItem[] {
  const isTs = config.language === "typescript";
  const ext = isTs ? "ts" : "js";
  const compExt = isTs ? "tsx" : "jsx";

  const folders = config.folders || [];
  const hasFolder = (folderName: string) => folders.includes(folderName as any);

  const hasRedux = config.integrations.includes("redux") && (hasFolder("store") || hasFolder("redux"));
  const hasQuery = config.integrations.includes("query");
  const hasMui = config.integrations.includes("mui");
  const hasShadcn = config.integrations.includes("shadcn") && hasFolder("components");
  const hasToast = (config.integrations.includes("toast") || config.integrations.includes("cookies")) && hasFolder("utils");
  const isNext = config.framework === "next";

  const files: FileTreeItem[] = [];

  // 1. Config & Constants
  if (hasFolder("config")) {
    files.push({
      path: `src/config/index.${ext}`,
      content: `export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || 'https://api.devblueprint.com/v1';

export const API_AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || process.env.VITE_AUTH_URL || 'https://api.devblueprint.com/auth';

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const APP_NAME = '${config.projectName}';
`,
    });
  }

  if (hasFolder("constants")) {
    files.push({
      path: `src/constants/index.${ext}`,
      content: `export const APP_CONSTANTS = Object.freeze({
  DEFAULT_LANGUAGE: 'en',
  STORAGE_PREFIX: 'devblueprint_',
  DEFAULT_PAGE_SIZE: 20,
});
`,
    });
  }

  // 2. Utils: pages-info.utils.ts (Point 3) & utils.data.ts
  if (hasFolder("utils")) {
    files.push({
      path: `src/utils/utils.data.${ext}`,
      content: `export const userRoleConst = Object.freeze({
  admin: { label: 'Admin', value: 'admin' },
  manager: { label: 'Manager', value: 'manager' },
  user: { label: 'User', value: 'user' },
});

export const accessTokenValidityInSeconds = 86400; // 24 Hours

export const cookiesConst = Object.freeze({
  access_token: { key: 'access_token', maxAge: accessTokenValidityInSeconds },
  refresh_token: { key: 'refresh_token', maxAge: accessTokenValidityInSeconds * 7 },
  user: { key: 'user_info', maxAge: accessTokenValidityInSeconds },
});
`,
    });

    files.push({
      path: `src/utils/pages-info.utils.${ext}`,
      content: `import { userRoleConst } from './utils.data';

export const getPath = (path${isTs ? ": string" : ""}, params${isTs ? ": Record<string, string | number>" : ""})${isTs ? ": string" : ""} => {
  return Object.keys(params).reduce((updatedPath, key) => {
    const placeholder = \`:\${key}\`;
    return updatedPath.replace(placeholder, String(params[key]));
  }, path);
};

export const isPathMatch = (regexList${isTs ? ": RegExp[]" : ""}, path${isTs ? ": string" : ""})${isTs ? ": boolean" : ""} =>
  regexList.some((regex) => regex.test(path));

export const pagesInfo = {
  home: {
    key: 'home',
    label: 'Home',
    path: '/',
    regex: /^\\/$/,
    role: [userRoleConst.admin.value, userRoleConst.manager.value, userRoleConst.user.value],
    child: {},
  },
  login: {
    key: 'login',
    label: 'Login',
    path: '/login',
    regex: /^\\/login$/,
    role: Object.values(userRoleConst).map((r) => r.value),
    child: {},
  },
  dashboard: {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    regex: /^\\/dashboard$/,
    role: [userRoleConst.admin.value, userRoleConst.manager.value],
    child: {},
  },
  settings: {
    key: 'settings',
    label: 'Settings',
    path: '/settings',
    regex: /^\\/settings$/,
    role: [userRoleConst.admin.value],
    child: {},
  },
};
`,
    });
  }

  // 3. Hooks: useDebounce.ts & useStore.hooks.ts & useLocalStorage.ts
  if (hasFolder("hooks")) {
    files.push({
      path: `src/hooks/useDebounce.${ext}`,
      content: `"use client";
import { useState, useEffect } from 'react';

export const useDebounce = ${isTs ? "<T,>(value: T, delay = 500): T" : "(value, delay = 500)"} => {
  const [debouncedValue, setDebouncedValue] = useState${isTs ? "<T>" : ""}(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
`,
    });

    if (hasRedux) {
      files.push({
        path: `src/hooks/useStore.hooks.${ext}`,
        content: isTs
          ? `import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import type rootReducer from '@/store/rootReducer';

export type RootState = ReturnType<typeof rootReducer>;

type Selector<T> = (state: RootState) => T;

export const useAppState = <T,>(selector: Selector<T>): T => useSelector(selector);
export const useAppDispatcher = () => useDispatch<AppDispatch>();

export { useAppState as useAppSelector, useAppDispatcher as useAppDispatch };
`
          : `import { useSelector, useDispatch } from 'react-redux';

export const useAppState = (selector) => useSelector(selector);
export const useAppDispatcher = () => useDispatch();

export { useAppState as useAppSelector, useAppDispatcher as useAppDispatch };
`,
      });
    }

    files.push({
      path: `src/hooks/useLocalStorage.${ext}`,
      content: `"use client";
import { useState, useEffect } from 'react';

export function useLocalStorage${isTs ? "<T>(key: string, initialValue: T)" : "(key, initialValue)"} {
  const [storedValue, setStoredValue] = useState${isTs ? "<T>" : ""}(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue]${isTs ? " as const" : ""};
}

export default useLocalStorage;
`,
    });
  }

  // 4. Services: auth & dashboard each with .service.ts, .const.ts, and .types.ts (Point 9)
  if (hasFolder("services")) {
    files.push({
      path: `src/services/auth/auth.const.${ext}`,
      content: `export const authUrlEnums = Object.freeze({
  LOGIN: '/login',
  LOGOUT: '/logout',
  REFRESH_TOKEN: '/refresh-token',
  ME: '/me',
});
`,
    });

    if (isTs) {
      files.push({
        path: `src/services/auth/auth.types.ts`,
        content: `export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface RefreshTokenResponse {
  token: string;
}
`,
      });
    }

    files.push({
      path: `src/services/auth/auth.service.${ext}`,
      content: `${
        hasFolder("apiInstance")
          ? `import { baseAuthApiInstance, baseCredApiInstance, baseLoginApiInstance } from '@/apiInstance/axios.apiInstance';`
          : `import axios from 'axios';`
      }
import { authUrlEnums } from './auth.const';
${isTs ? `import type { LoginPayload, AuthResponse, RefreshTokenResponse } from './auth.types';\n` : ""}
class AuthService {
  static authService = new AuthService();

  login = async ({ body }${isTs ? ": { body: LoginPayload }" : ""}) => {
    ${
      hasFolder("apiInstance")
        ? `const response = await baseLoginApiInstance().post${isTs ? "<AuthResponse>" : ""}(authUrlEnums.LOGIN, body);
    return response.data;`
        : `const response = await axios.post${isTs ? "<AuthResponse>" : ""}('/auth/login', body);
    return response.data;`
    }
  };

  refreshToken = async ({ body = {} }${isTs ? ": { body?: Record<string, any> } = {}" : ""}) => {
    ${
      hasFolder("apiInstance")
        ? `const response = await baseCredApiInstance().post${isTs ? "<RefreshTokenResponse>" : ""}(authUrlEnums.REFRESH_TOKEN, body);
    return response.data;`
        : `const response = await axios.post${isTs ? "<RefreshTokenResponse>" : ""}('/auth/refresh-token', body);
    return response.data;`
    }
  };

  getCurrentUser = async () => {
    ${
      hasFolder("apiInstance")
        ? `const response = await baseAuthApiInstance().get(authUrlEnums.ME);
    return response.data;`
        : `const response = await axios.get('/auth/me');
    return response.data;`
    }
  };

  logout = async () => {
    ${
      hasFolder("apiInstance")
        ? `const response = await baseAuthApiInstance().post(authUrlEnums.LOGOUT);
    return response.data;`
        : `const response = await axios.post('/auth/logout');
    return response.data;`
    }
  };
}

export default AuthService.authService;
`,
    });

    files.push({
      path: `src/services/dashboard/dashboard.const.${ext}`,
      content: `export const dashboardUrlEnums = Object.freeze({
  STATS: '/dashboard/stats',
  RECENT_ITEMS: '/dashboard/recent-items',
  ANALYTICS: '/dashboard/analytics',
});
`,
    });

    if (isTs) {
      files.push({
        path: `src/services/dashboard/dashboard.types.ts`,
        content: `export interface DashboardStats {
  totalUsers: number;
  activeSessions: number;
  revenue: number;
  conversionRate: number;
}

export interface DashboardItem {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}
`,
      });
    }

    files.push({
      path: `src/services/dashboard/dashboard.service.${ext}`,
      content: `${
        hasFolder("apiInstance")
          ? `import { baseAuthApiInstance } from '@/apiInstance/axios.apiInstance';`
          : `import axios from 'axios';`
      }
import { dashboardUrlEnums } from './dashboard.const';
${isTs ? `import type { DashboardStats, DashboardItem } from './dashboard.types';\n` : ""}
class DashboardService {
  static dashboardService = new DashboardService();

  getStats = async () => {
    ${
      hasFolder("apiInstance")
        ? `const response = await baseAuthApiInstance().get${isTs ? "<DashboardStats>" : ""}(dashboardUrlEnums.STATS);
    return response.data;`
        : `const response = await axios.get${isTs ? "<DashboardStats>" : ""}('/dashboard/stats');
    return response.data;`
    }
  };

  getRecentItems = async (params${isTs ? "?: Record<string, any>" : ""}) => {
    ${
      hasFolder("apiInstance")
        ? `const response = await baseAuthApiInstance().get${isTs ? "<DashboardItem[]>" : ""}(dashboardUrlEnums.RECENT_ITEMS, { params });
    return response.data;`
        : `const response = await axios.get${isTs ? "<DashboardItem[]>" : ""}('/dashboard/recent-items', { params });
    return response.data;`
    }
  };
}

export default DashboardService.dashboardService;
`,
    });
  }

  // 5. Components: DashboardView & Loaders
  if (hasFolder("components")) {
    files.push({
      path: `src/components/loaders/full-page-loader.${compExt}`,
      content: `import React from 'react';

export const FullPageLoader = ({ isLoading = true }${isTs ? ": { isLoading?: boolean }" : ""}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-600 tracking-wide">
          Loading application...
        </p>
      </div>
    </div>
  );
};

export default FullPageLoader;
`,
    });

    files.push({
      path: `src/components/dashboard/dashboard-view.${compExt}`,
      content: `import React from 'react';
${hasShadcn ? `import { Button } from '@/components/ui/button';\n` : ""}
export const DashboardView = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome to ${config.projectName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enterprise Project Template configured with clean modular architecture.
            </p>
          </div>
          ${
            hasShadcn
              ? `<Button onClick={() => alert('DevBlueprint Action Triggered!')}>
            + New Record
          </Button>`
              : ""
          }
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <span className="text-xs font-semibold text-blue-600 uppercase">Framework</span>
            <p className="text-xl font-bold text-blue-900 mt-1">${config.framework.toUpperCase()}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
            <span className="text-xs font-semibold text-purple-600 uppercase">Language</span>
            <p className="text-xl font-bold text-purple-900 mt-1">${config.language.toUpperCase()}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <span className="text-xs font-semibold text-emerald-600 uppercase">Preset</span>
            <p className="text-xl font-bold text-emerald-900 mt-1">${config.preset.toUpperCase()}</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <span className="text-xs font-semibold text-amber-600 uppercase">Modules</span>
            <p className="text-xl font-bold text-amber-900 mt-1">${folders.length} Folders</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
`,
    });
  }

  // 6. Providers: store.provider, navbar.provider, modal.provider, layout.provider, index (Point 3 & 7)
  if (hasFolder("provider")) {
    // modal.provider.tsx (Point 3)
    files.push({
      path: `src/provider/modal.provider.${compExt}`,
      content: `"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';

${isTs ? `export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: any;
  title?: string;
  isLoading?: boolean;
}

export interface ModalContextType {
  modal: ModalState;
  openModal: (type: string, data?: any, title?: string) => void;
  closeModal: () => void;
  setModalLoading: (loading: boolean) => void;
}
` : ""}
const ModalContext = createContext${isTs ? "<ModalContextType>" : ""}({
  modal: { isOpen: false },
  openModal: () => {},
  closeModal: () => {},
  setModalLoading: () => {},
});

export const ModalProvider = ({ children }${isTs ? ": { children?: React.ReactNode }" : ""}) => {
  const [modal, setModal] = useState${isTs ? "<ModalState>" : ""}({ isOpen: false });

  const openModal = useCallback((type${isTs ? ": string" : ""}, data${isTs ? "?: any" : ""}, title${isTs ? "?: string" : ""}) => {
    setModal({ isOpen: true, type, data, title, isLoading: false });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, data: null, type: undefined, title: undefined, isLoading: false });
  }, []);

  const setModalLoading = useCallback((isLoading${isTs ? ": boolean" : ""}) => {
    setModal((prev) => ({ ...prev, isLoading }));
  }, []);

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal, setModalLoading }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
export default ModalProvider;
`,
    });

    files.push({
      path: `src/provider/store.provider.${compExt}`,
      content: hasRedux
        ? `"use client";
import React from 'react';
import { Provider } from 'react-redux';
import store from '@/store';

export const StoreProvider = ({ children }${isTs ? ": { children?: React.ReactNode }" : ""}) => {
  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
`
        : `import React from 'react';
export const StoreProvider = ({ children }${isTs ? ": { children?: React.ReactNode }" : ""}) => <>{children}</>;
export default StoreProvider;
`,
    });

    files.push({
      path: `src/provider/navbar.provider.${compExt}`,
      content: `"use client";
import React, { createContext, useContext, useState } from 'react';

${isTs ? `interface NavbarContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}
` : ""}
const NavbarContext = createContext${isTs ? "<NavbarContextType>" : ""}({
  sidebarOpen: true,
  toggleSidebar: () => {},
});

export const NavbarProvider = ({ children }${isTs ? ": { children?: React.ReactNode }" : ""}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <NavbarContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => useContext(NavbarContext);
export default NavbarProvider;
`,
    });

    files.push({
      path: `src/provider/layout.provider.${compExt}`,
      content: `"use client";
import React from 'react';
${hasMui ? `import ThemeWrapperProvider from './theme.provider';\n` : ""}${hasQuery ? `import QueryProvider from './query.provider';\n` : ""}${hasToast ? `import { Toaster } from 'react-hot-toast';\n` : ""}
export const LayoutProvider = ({ children }${isTs ? ": { children?: React.ReactNode }" : ""}) => {
  let content = (
    <>
      {children}
      ${hasToast ? `<Toaster position="top-right" />` : ""}
    </>
  );

  ${hasMui ? `content = <ThemeWrapperProvider>{content}</ThemeWrapperProvider>;` : ""}
  ${hasQuery ? `content = <QueryProvider>{content}</QueryProvider>;` : ""}

  return content;
};

export default LayoutProvider;
`,
    });

    files.push({
      path: `src/provider/index.${compExt}`,
      content: `"use client";
import React, { Suspense } from 'react';
${hasFolder("components") ? `import FullPageLoader from '@/components/loaders/full-page-loader';` : ""}
import StoreProvider from './store.provider';
import LayoutProvider from './layout.provider';
import NavbarProvider from './navbar.provider';
import ModalProvider from './modal.provider';

export const Provider = ({ children }${isTs ? ": { children?: React.ReactNode }" : ""}) => {
  return (
    <Suspense ${hasFolder("components") ? `fallback={<FullPageLoader isLoading={true} />}` : `fallback={<div>Loading...</div>}`}>
      <StoreProvider>
        <NavbarProvider>
          <ModalProvider>
            <LayoutProvider>
              {children}
            </LayoutProvider>
          </ModalProvider>
        </NavbarProvider>
      </StoreProvider>
    </Suspense>
  );
};

export default Provider;
export { StoreProvider, LayoutProvider, NavbarProvider, ModalProvider };
`,
    });
  }

  // 7. Framework Specific App / Routes
  if (isNext) {
    files.push({
      path: `src/proxy.${ext}`,
      content: `import { NextResponse } from 'next/server';
${isTs ? "import type { NextRequest } from 'next/server';\n" : ""}
export function middleware(request${isTs ? ": NextRequest" : ""}) {
  const token = request.cookies.get('access_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  if (!token && !isAuthPage && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
`,
    });

    if (config.nextRouter === "pages") {
      // Pages Router
      files.push({
        path: `src/pages/_app.${compExt}`,
        content: `import React from 'react';
${isTs ? "import type { AppProps } from 'next/app';\n" : ""}import '@/globals.css';
import '@/theme.css';
${hasFolder("provider") ? `import Provider from '@/provider';\n` : ""}
export default function App({ Component, pageProps }${isTs ? ": AppProps" : ""}) {
  return (
    ${hasFolder("provider") ? `<Provider><Component {...pageProps} /></Provider>` : `<Component {...pageProps} />`}
  );
}
`,
      });

      files.push({
        path: `src/pages/_document.${compExt}`,
        content: `import { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
`,
      });

      files.push({
        path: `src/pages/index.${compExt}`,
        content: `import React from 'react';
import Head from 'next/head';
${hasFolder("components") ? `import DashboardView from '@/components/dashboard/dashboard-view';\n` : ""}
export default function HomePage() {
  return (
    <>
      <Head>
        <title>${config.projectName} - DevBlueprint</title>
        <meta name="description" content="Enterprise Scaffolding built with DevBlueprint" />
      </Head>
      <main className="min-h-screen py-10">
        ${hasFolder("components") ? `<DashboardView />` : `<div className="p-8 font-bold text-2xl">Welcome to ${config.projectName}</div>`}
      </main>
    </>
  );
}
`,
      });

      files.push({
        path: `src/pages/404.${compExt}`,
        content: `import React from 'react';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-lg text-slate-600">Page not found</p>
      <Link href="/" className="mt-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
        Return Home
      </Link>
    </div>
  );
}
`,
      });
    } else {
      // App Router (default)
      files.push({
        path: `src/app/layout.${compExt}`,
        content: `import React from 'react';
import '@/globals.css';
import '@/theme.css';
${hasFolder("provider") ? `import Provider from '@/provider';\n` : ""}
export const metadata = {
  title: '${config.projectName} - DevBlueprint',
  description: 'Enterprise Scaffolding built with DevBlueprint',
};

export default function RootLayout({
  children,
}${isTs ? ": { children?: React.ReactNode; }" : ""}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        ${hasFolder("provider") ? `<Provider>${"\n          "}{children}${"\n        "}</Provider>` : "{children}"}
      </body>
    </html>
  );
}
`,
      });

      files.push({
        path: `src/app/page.${compExt}`,
        content: `import React from 'react';
${hasFolder("components") ? `import DashboardView from '@/components/dashboard/dashboard-view';\n` : ""}
export default function HomePage() {
  return (
    <main className="min-h-screen py-10">
      ${hasFolder("components") ? `<DashboardView />` : `<div className="p-8 font-bold text-2xl">Welcome to ${config.projectName}</div>`}
    </main>
  );
}
`,
      });

      files.push({
        path: `src/app/not-found.${compExt}`,
        content: `import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-lg text-slate-600">Page not found</p>
      <Link href="/" className="mt-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
        Return Home
      </Link>
    </div>
  );
}
`,
      });
    }
  } else {
    // Vite & CRA
    files.push({
      path: `src/routes/AppRoutes.${compExt}`,
      content: `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
${hasFolder("components") ? `import DashboardView from '@/components/dashboard/dashboard-view';\n` : ""}
export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={${hasFolder("components") ? `<DashboardView />` : `<div>Home</div>`}} />
        <Route path="/dashboard" element={${hasFolder("components") ? `<DashboardView />` : `<div>Dashboard</div>`}} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
`,
    });

    files.push({
      path: `src/App.${compExt}`,
      content: `import React from 'react';
${hasFolder("provider") ? `import Provider from '@/provider';\n` : ""}import AppRoutes from '@/routes/AppRoutes';
import '@/globals.css';
import '@/theme.css';

export function App() {
  return (
    ${hasFolder("provider") ? `<Provider><AppRoutes /></Provider>` : `<AppRoutes />`}
  );
}

export default App;
`,
    });

    if (config.framework === "vite") {
      files.push({
        path: `src/main.${compExt}`,
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      });
    } else {
      files.push({
        path: `src/index.${compExt}`,
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root')${isTs ? " as HTMLElement" : ""}
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      });
    }
  }

  return files;
}
