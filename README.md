# DevBlueprint (`create-devblueprint`)

> Enterprise-ready scaffolding CLI for React, Vite, and Next.js applications with custom modular folder selection, dynamic package version resolution, and interactive setup.

---

## ⚡ Quick Start

### Using your favorite package manager:

```bash
# Interactive prompt mode
npx create-devblueprint my-app

# Or using npm create
npm create devblueprint my-app

# Using pnpm / yarn / bun
pnpm create devblueprint my-app
yarn create devblueprint my-app
bun create devblueprint my-app
```

---

## 🎯 Modular Enterprise Architecture

DevBlueprint allows you to select exactly which modules and folders to include in your project:

```text
src/
├── apiInstance/             # Centralized Axios instances (public, cred, auth)
│   └── axios.apiInstance.ts
├── interceptors/            # JWT Token interceptors & auto-refresh
│   └── axios.interceptor.ts
├── services/                # Singleton domain services
│   ├── auth/                # auth.service.ts, auth.const.ts
│   └── dashboard/           # dashboard.service.ts, dashboard.const.ts
├── store/                   # Root Redux store configuration
│   ├── index.ts             # configureStore with devTools
│   ├── root-reducer.ts      # Combined feature reducers
│   └── hooks.ts             # Typed useAppDispatch, useAppSelector
├── redux/                   # Domain state slices
│   ├── auth/authSlice.ts    # Authentication & user state
│   └── local/localSlice.ts  # Theme & sidebar UI states
├── provider/                # Master provider wrappers
│   ├── index.tsx            # Suspense + full-page-loader + store + navbar + layout
│   ├── store.provider.tsx   # Redux Provider
│   ├── layout.provider.tsx  # MUI Theme + Tailwind CSS + Toast wrapper
│   └── navbar.provider.tsx  # Sidebar navigation context
├── components/              # Shared component library
│   ├── loaders/             # full-page-loader.tsx
│   └── ui/                  # shadcn/ui primitives (Button, Card, Input)
├── config/                  # App constants & API endpoints
│   └── index.ts             # API_BASE_URL, API_AUTH_BASE_URL, environment detection
├── constants/               # Route paths, user roles, cookie names
├── hooks/                   # Reusable custom hooks
├── utils/                   # Shared utility helpers
│   ├── local.cookies.ts     # Cookie helpers using cookies-next
│   ├── utils.data.ts        # Validity durations & cookie keys
│   └── dayjs.ts             # Day.js with timezone & relativeTime plugins
├── globals.css              # Tailwind CSS v4 (@import "tailwindcss"; or v3)
├── theme.css                # Color variables, heights & design tokens
├── proxy.ts / middleware.ts # Route authentication & security guards (Next.js)
├── app/ or routes/          # Framework page routing (Next.js App Router / Vite React Router)
└── main.tsx / index.tsx     # Client DOM bootstrap
```

---

## 🚀 Package Version Engine

DevBlueprint delivers **latest package versions** (React 19, Next.js 16, Tailwind CSS v4, React Router DOM v7) while allowing complete flexibility for custom or future versions.

### 1. Version Presets (`--preset`)
- **`enterprise` (Default)**: Battle-tested production stack:
  - React `19.2.3`, Next.js `16.1.1` (Turbopack)
  - Tailwind CSS `^4` with `@tailwindcss/postcss: ^4`
  - Redux Toolkit `^2.11.2`, React Redux `^9.2.0`
  - MUI `^7.3.6`, Axios `^1.13.2`, Zod `^4.3.6`, Day.js `^1.11.19`
- **`latest`**: Resolves latest semantic versions across all libraries.
- **`stable`**: LTS versions (React 18.3, Next 15, Tailwind v3).

### 2. Override Any Package Version (`--pkg`)
You can override any specific package version at scaffold time:

```bash
# Pin React and Next.js to specific versions:
npx create-devblueprint my-app --pkg react@19.0.0 --pkg next@16.0.0

# Override multiple packages via JSON:
npx create-devblueprint my-app --package-versions '{"axios":"^1.15.0","dayjs":"^1.12.0"}'
```

### 3. Dynamically Fetch npm Live Latest (`--fetch-latest`)
Query the npm registry directly to retrieve tomorrow's releases automatically:

```bash
npx create-devblueprint my-app --fetch-latest
```

---

## 🛠️ CLI Options & Flags

| Flag | Description | Options / Defaults |
|------|-------------|--------------------|
| `-f, --framework <type>` | Target framework | `vite` (default), `next`, `cra` |
| `-l, --language <lang>` | Language type | `typescript` (default), `javascript` |
| `-a, --architecture <arch>` | Architecture pattern | `enterprise` (default), `feature`, `minimal` |
| `--folders <items...>` | Selective folders | `apiInstance`, `interceptors`, `services`, `store`, `redux`, `provider`, `components`, `config`, `constants`, `hooks`, `utils`, `layouts` |
| `--preset <preset>` | Version preset | `enterprise` (default), `latest`, `stable` |
| `--pkg <items...>` | Override package version | e.g. `--pkg react@19.2.3 --pkg next@16.1.1` |
| `--package-versions <json>` | Bulk JSON version overrides | e.g. `'{"next":"16.1.1"}'` |
| `--fetch-latest` | Live query npm registry for cutting-edge versions | `false` |
| `-i, --integrations <items...>` | List of integrations | `redux`, `query`, `axios`, `tailwind`, `mui`, `shadcn`, `dayjs`, `forms`, `testing`, `cookies`, `toast` |
| `-p, --package-manager <pm>` | Package manager | `npm`, `pnpm`, `yarn`, `bun` |
| `--install` | Automatically install dependencies | `false` |
| `--no-git` | Skip `git init` | Initializes git by default |
| `-y, --yes` | Quick scaffold with defaults | `false` |

---

## 📦 Publishing to npm

```bash
# 1. Run tests & build
npm test
npm run build

# 2. Authenticate
npm login

# 3. Publish to npm registry
npm publish --access public
```

---

## 📄 License

MIT © [DevBlueprint Team](https://github.com)
