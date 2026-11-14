import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getReduxIntegration(config: ProjectConfig): Promise<{
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

  const rtkVer = await getVersion("@reduxjs/toolkit", vOpts);
  const reactReduxVer = await getVersion("react-redux", vOpts);

  const pkg: Partial<PackageJsonConfig> = {
    dependencies: {
      "@reduxjs/toolkit": rtkVer,
      "react-redux": reactReduxVer,
    },
  };

  // 1. rootReducer.ts matching production pattern
  const rootReducerContent = `import { combineReducers } from '@reduxjs/toolkit';
import localsSlice from '@/redux/local/slice';
import authSlice from '@/redux/auth/slice';
import pagesInfoSlice from '@/redux/pages-info/slice';

// page reducers
export const pageReducers = {
  auth: authSlice,
};

// global reducers
export const globalReducers = {
  locals: localsSlice,
  pagesInfo: pagesInfoSlice,
};

// modal reducers
export const modalReducers = {};

const rootReducer = combineReducers({
  ...modalReducers,
  ...pageReducers,
  ...globalReducers,
});

export default rootReducer;
`;

  // 2. store/index.ts
  const storeIndexContent = isTs
    ? `import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export default store;
`
    : `import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
`;

  // 3. redux/local module (const.ts, state.ts, slice.ts)
  const localConst = `export const genderOptions = {
  male: { label: "Male", key: "male", value: "male" },
  female: { label: "Female", key: "female", value: "female" },
  other: { label: "Other", key: "other", value: "other" },
};

export const themeOptions = {
  light: { label: "Light", key: "light", value: "light" },
  dark: { label: "Dark", key: "dark", value: "dark" },
};
`;

  const localState = isTs
    ? `export interface LocalState {
  sidebarOpen: boolean;
  themeMode: 'light' | 'dark';
  modal: Record<string, any>;
}

export const localsInitialState: LocalState = {
  sidebarOpen: true,
  themeMode: 'light',
  modal: {},
};
`
    : `export const localsInitialState = {
  sidebarOpen: true,
  themeMode: 'light',
  modal: {},
};
`;

  const localSlice = `import { createSlice } from '@reduxjs/toolkit';
import { localsInitialState } from './state';

const locals = createSlice({
  name: 'locals',
  initialState: localsInitialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, { payload }) => {
      state.sidebarOpen = payload;
    },
    setThemeMode: (state, { payload }) => {
      state.themeMode = payload;
    },
    setModal: (state, { payload }) => {
      state.modal = payload;
    },
    resetModal: (state) => {
      state.modal = localsInitialState.modal;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setThemeMode, setModal, resetModal } = locals.actions;
export default locals.reducer;
`;

  // 4. redux/auth module (const.ts, state.ts, slice.ts)
  const authConst = `export const authConst = {
  TOKEN_KEY: 'access_token',
  REFRESH_KEY: 'refresh_token',
};
`;

  const authState = isTs
    ? `export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const authInitialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};
`
    : `export const authInitialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};
`;

  const authSlice = `import { createSlice } from '@reduxjs/toolkit';
import { authInitialState } from './state';

const auth = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.token = payload.token;
      state.isAuthenticated = true;
    },
    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setLoading, logout } = auth.actions;
export default auth.reducer;
`;

  // 5. redux/pages-info module (const.ts, state.ts, slice.ts)
  const pagesInfoConst = `export const pagesInfoConst = {
  DEFAULT_PAGE: 'home',
};
`;

  const pagesInfoState = isTs
    ? `export interface PageItem {
  key: string;
  label: string;
  path: string;
}

export interface PagesInfoState {
  currentPage: PageItem;
  breadcrumbs: PageItem[];
}

export const pagesInfoInitialState: PagesInfoState = {
  currentPage: { key: 'home', label: 'Home', path: '/' },
  breadcrumbs: [],
};
`
    : `export const pagesInfoInitialState = {
  currentPage: { key: 'home', label: 'Home', path: '/' },
  breadcrumbs: [],
};
`;

  const pagesInfoSlice = `import { createSlice } from '@reduxjs/toolkit';
import { pagesInfoInitialState } from './state';

const pagesInfo = createSlice({
  name: 'pagesInfo',
  initialState: pagesInfoInitialState,
  reducers: {
    setCurrentPage: (state, { payload }) => {
      state.currentPage = payload;
    },
    setBreadcrumbs: (state, { payload }) => {
      state.breadcrumbs = payload;
    },
  },
});

export const { setCurrentPage, setBreadcrumbs } = pagesInfo.actions;
export default pagesInfo.reducer;
`;

  const files: FileTreeItem[] = [
    {
      path: `src/store/index.${ext}`,
      content: storeIndexContent,
    },
    {
      path: `src/store/rootReducer.${ext}`,
      content: rootReducerContent,
    },
    {
      path: `src/store/root-reducer.${ext}`,
      content: `export { default } from './rootReducer';\n`,
    },
    // redux/local
    {
      path: `src/redux/local/const.${ext}`,
      content: localConst,
    },
    {
      path: `src/redux/local/state.${ext}`,
      content: localState,
    },
    {
      path: `src/redux/local/slice.${ext}`,
      content: localSlice,
    },
    // redux/auth
    {
      path: `src/redux/auth/const.${ext}`,
      content: authConst,
    },
    {
      path: `src/redux/auth/state.${ext}`,
      content: authState,
    },
    {
      path: `src/redux/auth/slice.${ext}`,
      content: authSlice,
    },
    // redux/pages-info
    {
      path: `src/redux/pages-info/const.${ext}`,
      content: pagesInfoConst,
    },
    {
      path: `src/redux/pages-info/state.${ext}`,
      content: pagesInfoState,
    },
    {
      path: `src/redux/pages-info/slice.${ext}`,
      content: pagesInfoSlice,
    },
  ];

  return { pkg, files };
}
