# DevBlueprint

Scaffold React apps for Vite, Next.js, or Create React App with an interactive CLI, selectable integrations, and reusable project architecture.

[npm package](https://www.npmjs.com/package/create-devblueprint) · [Source code](https://github.com/knight-456/dev-blue-print) · [Report an issue](https://github.com/knight-456/dev-blue-print/issues)

## Get started

```bash
npm create devblueprint my-app
```

Answer the prompts to choose a framework, language, architecture, and integrations. Then install the generated app's dependencies and start its development server:

```bash
cd my-app
npm install
npm run dev
```

You can also use `npx create-devblueprint my-app`, `pnpm create devblueprint my-app`, `yarn create devblueprint my-app`, or `bun create devblueprint my-app`.

## What it generates

- **Frameworks:** Vite, Next.js, and Create React App
- **Languages:** TypeScript or JavaScript
- **Architectures:** enterprise, modular, or minimal
- **Optional integrations:** Redux, TanStack Query, Axios, Tailwind CSS, MUI, shadcn/ui, Day.js, forms, testing, cookies, toast notifications, and motion
- **Project setup:** select integrations and folders, choose a package manager, and optionally install dependencies or initialize Git

The enterprise architecture organizes common concerns into modules such as API clients, services, state management, providers, components, configuration, hooks, and utilities. Choose a smaller architecture or select only the integrations your project needs.

## Non-interactive example

Pass `--yes` to use defaults, or specify the project options:

```bash
npx create-devblueprint my-app --framework vite --language typescript --architecture modular --integrations redux query axios --yes
```

Add `--install` to install dependencies during scaffolding. Package installation is otherwise left to you.

## Package versions

Choose a version preset:

```bash
npx create-devblueprint my-app --preset stable
```

Available presets are `enterprise` (default), `latest`, and `stable`. Override individual versions with `--pkg`, or provide several overrides as JSON:

```bash
npx create-devblueprint my-app --pkg react@19.0.0 --pkg next@16.0.0
npx create-devblueprint my-app --package-versions '{"axios":"^1.15.0","dayjs":"^1.12.0"}'
```

Use `--fetch-latest` to query npm for current package versions when scaffolding.

## CLI options

| Option | Description |
| --- | --- |
| `-f, --framework <type>` | `vite` (default), `next`, or `cra` |
| `-l, --language <lang>` | `typescript` (default) or `javascript` |
| `-a, --architecture <type>` | `enterprise` (default), `modular`, or `minimal` |
| `--router <type>` | Next.js router: `app` (default) or `pages` |
| `--folders <items...>` | Select folders such as `services`, `store`, `components`, and `utils` |
| `-i, --integrations <items...>` | Select integrations such as `redux`, `query`, `axios`, and `tailwind` |
| `-p, --package-manager <pm>` | `npm`, `pnpm`, `yarn`, or `bun` |
| `--preset <preset>` | Package version preset: `enterprise`, `latest`, or `stable` |
| `--pkg <items...>` | Override individual package versions |
| `--package-versions <json>` | Override package versions with a JSON object |
| `--fetch-latest` | Query npm for current package versions |
| `--install` | Install generated project dependencies |
| `--no-git` | Do not initialize a Git repository |
| `-y, --yes` | Skip interactive prompts and use defaults |

Run `npx create-devblueprint --help` for the full option list.

## Requirements

Node.js 18 or newer.

## Contributing and support

Bug reports and feature requests are welcome in [GitHub Issues](https://github.com/knight-456/dev-blue-print/issues). See the [repository](https://github.com/knight-456/dev-blue-print) for the source and contribution details.

## License

MIT © [DevBlueprint contributors](https://github.com/knight-456/dev-blue-print/graphs/contributors)
