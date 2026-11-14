import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getMuiIntegration(config: ProjectConfig): Promise<{
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

  const muiVer = await getVersion("@mui/material", vOpts);
  const muiIconsVer = await getVersion("@mui/icons-material", vOpts);
  const muiDatePickersVer = await getVersion("@mui/x-date-pickers", vOpts);
  const emotionReactVer = await getVersion("@emotion/react", vOpts);
  const emotionStyledVer = await getVersion("@emotion/styled", vOpts);

  const pkg: Partial<PackageJsonConfig> = {
    dependencies: {
      "@mui/material": muiVer,
      "@mui/icons-material": muiIconsVer,
      "@mui/x-date-pickers": muiDatePickersVer,
      "@emotion/react": emotionReactVer,
      "@emotion/styled": emotionStyledVer,
    },
  };

  const themeContent = `import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      dark: '#1d4ed8',
      light: '#60a5fa',
    },
    secondary: {
      main: '#7c3aed',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
});

export default muiTheme;
`;

  const themeProviderContent = `"use client";
import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import muiTheme from '@/styles/theme';

export const ThemeWrapperProvider = ({ children }${isTs ? ": { children: React.ReactNode }" : ""}) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default ThemeWrapperProvider;
`;

  const files: FileTreeItem[] = [
    {
      path: `src/styles/theme.${ext}`,
      content: themeContent,
    },
    {
      path: `src/provider/theme.provider.${compExt}`,
      content: themeProviderContent,
    },
  ];

  return { pkg, files };
}
