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
  const hasTailwind = config.integrations.includes("tailwind");
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
      content: `export const ROUTE_PATHS = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
});

export const USER_ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
});

export const COOKIE_KEYS = Object.freeze({
  ACCESS_TOKEN: 'devblueprint_access_token',
  REFRESH_TOKEN: 'devblueprint_refresh_token',
  USER_DATA: 'devblueprint_user_data',
});
`,
    });
  }

  // 2. Utils: utils.data & local.cookies
  if (hasFolder("utils")) {
    files.push({
      path: `src/utils/utils.data.${ext}`,
      content: `export const accessTokenValidityInSeconds = 86400; // 24 Hours

export const cookiesConst = Object.freeze({
  access_token: { key: 'access_token', maxAge: accessTokenValidityInSeconds },
  refresh_token: { key: 'refresh_token', maxAge: accessTokenValidityInSeconds * 7 },
  user: { key: 'user_info', maxAge: accessTokenValidityInSeconds },
});
`,
    });
  }

  // 3. Services: Auth & Dashboard
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

    files.push({
      path: `src/services/auth/auth.service.${ext}`,
      content: `${
        hasFolder("apiInstance")
          ? `import { baseAuthApiInstance, baseCredApiInstance, baseLoginApiInstance } from '@/apiInstance/axios.apiInstance';`
          : `import axios from 'axios';`
      }
import { authUrlEnums } from './auth.const';

class AuthService {
  static authService = new AuthService();

  login = async ({ body }${isTs ? ": { body: any }" : ""}) => {
    ${
      hasFolder("apiInstance")
        ? `const response = await baseLoginApiInstance().post(authUrlEnums.LOGIN, body);
    return response.data;`
        : `const response = await axios.post('/auth/login', body);
    return response.data;`
    }
  };

  refreshToken = async ({ body = {} }${isTs ? ": { body?: any } = {}" : ""}) => {
    ${
      hasFolder("apiInstance")
        ? `const response = await baseCredApiInstance().post(authUrlEnums.REFRESH_TOKEN, body);
    return response.data;`
        : `const response = await axios.post('/auth/refresh-token', body);
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

    files.push({
      path: `src/services/dashboard/dashboard.service.${ext}`,
      content: `${
        hasFolder("apiInstance")
          ? `import { baseAuthApiInstance } from '@/apiInstance/axios.apiInstance';`
          : `import axios from 'axios';`
      }
import { dashboardUrlEnums } from './dashboard.const';

class DashboardService {
  static dashboardService = new DashboardService();

  getStats = async () => {
    ${
      hasFolder("apiInstance")
        ? `const response = await baseAuthApiInstance().get(dashboardUrlEnums.STATS);
    return response.data;`
        : `const response = await axios.get('/dashboard/stats');
    return response.data;`
    }
  };

  getRecentItems = async (params${isTs ? "?: Record<string, any>" : ""}) => {
    ${
      hasFolder("apiInstance")
        ? `const response = await baseAuthApiInstance().get(dashboardUrlEnums.RECENT_ITEMS, { params });
    return response.data;`
        : `const response = await axios.get('/dashboard/recent-items', { params });
    return response.data;`
    }
  };
}

export default DashboardService.dashboardService;
`,
    });
  }

  // 4. Loaders: full-page-loader
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
  }

  // 5. Providers: store.provider, layout.provider, navbar.provider, index
  if (hasFolder("provider")) {
    files.push({
      path: `src/provider/store.provider.${compExt}`,
      content: hasRedux
        ? `"use client";
import React from 'react';
import { Provider } from 'react-redux';
import store from '@/store';

export const StoreProvider = ({ children }${isTs ? ": { children: React.ReactNode }" : ""}) => {
  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
`
        : `import React from 'react';
export const StoreProvider = ({ children }${isTs ? ": { children: React.ReactNode }" : ""}) => <>{children}</>;
export default StoreProvider;
`,
    });

    files.push({
      path: `src/provider/navbar.provider.${compExt}`,
      content: `"use client";
import React, { createContext, useContext, useState } from 'react';

interface NavbarContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const NavbarContext = createContext${isTs ? "<NavbarContextType>" : ""}({
  sidebarOpen: true,
  toggleSidebar: () => {},
});

export const NavbarProvider = ({ children }${isTs ? ": { children: React.ReactNode }" : ""}) => {
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
${hasMui ? `import { ThemeProvider, CssBaseline } from '@mui/material';\nimport muiTheme from '@/styles/theme';\n` : ""}${hasQuery ? `import { QueryClientProvider } from '@tanstack/react-query';\nimport queryClient from '@/provider/react-query';\n` : ""}${hasToast ? `import { Toaster } from 'react-hot-toast';\n` : ""}
export const LayoutProvider = ({ children }${isTs ? ": { children: React.ReactNode }" : ""}) => {
  let content = (
    <>
      {children}
      ${hasToast ? `<Toaster position="top-right" />` : ""}
    </>
  );

  ${hasMui ? `content = <ThemeProvider theme={muiTheme}><CssBaseline />{content}</ThemeProvider>;` : ""}
  ${hasQuery ? `content = <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>;` : ""}

  return content;
};

export default LayoutProvider;
`,
    });

    files.push({
      path: `src/provider/index.${compExt}`,
      content: `import React, { Suspense } from 'react';
${hasFolder("components") ? `import FullPageLoader from '@/components/loaders/full-page-loader';` : ""}
import StoreProvider from './store.provider';
import LayoutProvider from './layout.provider';
import NavbarProvider from './navbar.provider';

export const Provider = ({ children }${isTs ? ": { children: React.ReactNode }" : ""}) => {
  return (
    <Suspense ${hasFolder("components") ? `fallback={<FullPageLoader isLoading={true} />}` : `fallback={<div>Loading...</div>}`}>
      <StoreProvider>
        <NavbarProvider>
          <LayoutProvider>
            {children}
          </LayoutProvider>
        </NavbarProvider>
      </StoreProvider>
    </Suspense>
  );
};

export default Provider;
export { StoreProvider, LayoutProvider, NavbarProvider };
`,
    });
  }

  // 6. Layouts: MainLayout
  if (hasFolder("layouts")) {
    files.push({
      path: `src/layouts/MainLayout.${compExt}`,
      content: `import React from 'react';
${hasFolder("provider") ? `import { useNavbar } from '@/provider/navbar.provider';` : ""}

export const MainLayout = ({ children }${isTs ? ": { children: React.ReactNode }" : ""}) => {
  ${hasFolder("provider") ? `const { sidebarOpen, toggleSidebar } = useNavbar();` : `const sidebarOpen = true;\n  const toggleSidebar = () => {};`}

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-slate-100 text-slate-600 focus:outline-hidden cursor-pointer"
            >
              ☰
            </button>
            <span className="font-extrabold text-xl tracking-tight text-blue-600">
              ${config.projectName}
            </span>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-semibold text-slate-600">
            <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
            <span className="hover:text-blue-600 cursor-pointer">Analytics</span>
            <span className="hover:text-blue-600 cursor-pointer">Settings</span>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {sidebarOpen && (
          <aside className="w-64 border-r border-slate-200 bg-white p-4 space-y-2 hidden md:block">
            <div className="text-xs font-bold uppercase text-slate-400 px-3 py-1">
              Modules
            </div>
            <a href="#dashboard" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700">
              📊 Overview
            </a>
            <a href="#analytics" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700">
              📈 Analytics
            </a>
            <a href="#users" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700">
              👥 User Management
            </a>
          </aside>
        )}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 bg-white">
        ${config.projectName} • Powered by DevBlueprint
      </footer>
    </div>
  );
};

export default MainLayout;
`,
    });
  }

  // 7. Feature: Dashboard View
  files.push({
    path: `src/features/dashboard/components/DashboardView.${compExt}`,
    content: `import React from 'react';
${hasShadcn ? `import { Button } from '@/components/ui/button';\n` : ""}
export const DashboardView = () => {
  return (
    <div className="space-y-6">
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome to ${config.projectName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enterprise Project Template configured with modular architecture.
            </p>
          </div>
          ${
            hasShadcn
              ? `<Button onClick={() => alert('Action Triggered!')}>
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
            <span className="text-xs font-semibold text-amber-600 uppercase">Folders</span>
            <p className="text-xl font-bold text-amber-900 mt-1">${folders.length} Modules</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
`,
  });

  files.push({
    path: `src/features/dashboard/index.${ext}`,
    content: `export * from './components/DashboardView';\n`,
  });

  // 8. Framework Specific App / Routes
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

    files.push({
      path: `src/app/layout.${compExt}`,
      content: `import '@/globals.css';
import '@/theme.css';
${hasFolder("provider") ? `import Provider from '@/provider';\n` : ""}
export const metadata = {
  title: '${config.projectName} - DevBlueprint',
  description: 'Enterprise Scaffolding built with DevBlueprint',
};

export default function RootLayout({
  children,
}${isTs ? ": { children: React.ReactNode }" : ""}) {
  return (
    <html lang="en">
      <body className="antialiased">
        ${hasFolder("provider") ? `<Provider>${"\n          "}{children}${"\n        "}</Provider>` : "{children}"}
      </body>
    </html>
  );
}
`,
    });

    files.push({
      path: `src/app/page.${compExt}`,
      content: `${hasFolder("layouts") ? `import MainLayout from '@/layouts/MainLayout';\n` : ""}import DashboardView from '@/features/dashboard/components/DashboardView';

export default function HomePage() {
  return (
    ${hasFolder("layouts") ? `<MainLayout><DashboardView /></MainLayout>` : `<DashboardView />`}
  );
}
`,
    });
  } else {
    // Vite and CRA
    files.push({
      path: `src/routes/AppRoutes.${compExt}`,
      content: `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
${hasFolder("layouts") ? `import MainLayout from '@/layouts/MainLayout';\n` : ""}import DashboardView from '@/features/dashboard/components/DashboardView';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      ${hasFolder("layouts") ? `<MainLayout>` : ""}
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/dashboard" element={<DashboardView />} />
        </Routes>
      ${hasFolder("layouts") ? `</MainLayout>` : ""}
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
