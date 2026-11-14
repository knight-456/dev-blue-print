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

  const storeContent = isTs
    ? `import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './root-reducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
`
    : `import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './root-reducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
`;

  const rootReducerContent = `import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/redux/auth/authSlice';
import localReducer from '@/redux/local/localSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  local: localReducer,
});

export default rootReducer;
`;

  const hooksContent = isTs
    ? `import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`
    : `import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = (selector) => useSelector(selector);
`;

  const authSliceContent = isTs
    ? `import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
`
    : `import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
`;

  const localSliceContent = isTs
    ? `import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocalState {
  sidebarOpen: boolean;
  themeMode: 'light' | 'dark';
}

const initialState: LocalState = {
  sidebarOpen: true,
  themeMode: 'light',
};

export const localSlice = createSlice({
  name: 'local',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.themeMode = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setThemeMode } = localSlice.actions;
export default localSlice.reducer;
`
    : `import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  themeMode: 'light',
};

export const localSlice = createSlice({
  name: 'local',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setThemeMode } = localSlice.actions;
export default localSlice.reducer;
`;

  const files: FileTreeItem[] = [
    {
      path: `src/store/index.${ext}`,
      content: storeContent,
    },
    {
      path: `src/store/root-reducer.${ext}`,
      content: rootReducerContent,
    },
    {
      path: `src/store/hooks.${ext}`,
      content: hooksContent,
    },
    {
      path: `src/redux/auth/authSlice.${ext}`,
      content: authSliceContent,
    },
    {
      path: `src/redux/local/localSlice.${ext}`,
      content: localSliceContent,
    },
  ];

  return { pkg, files };
}
