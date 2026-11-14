import { Command } from "commander";
import type { CLIOptions, Framework, Language, Integration, PackageManager, VersionPreset, ProjectFolder } from "../types/index.js";

export function createCliCommand(): Command {
  const program = new Command();

  program
    .name("create-devblueprint")
    .description("Enterprise scaffolding CLI for React, Vite, and Next.js applications")
    .version("1.0.0")
    .argument("[project-name]", "Target project name and directory")
    .option("-f, --framework <type>", "Framework to use: vite | next | cra")
    .option("-l, --language <lang>", "Language to use: typescript | javascript")
    .option("-a, --architecture <arch>", "Architecture pattern: enterprise | modular | minimal", "enterprise")
    .option(
      "--folders <items...>",
      "Folders to include: apiInstance, interceptors, services, store, redux, provider, components, config, constants, hooks, utils"
    )
    .option(
      "-i, --integrations <items...>",
      "Integrations: redux, query, axios, tailwind, mui, shadcn, dayjs, forms, testing, cookies, toast, motion"
    )
    .option("-p, --package-manager <pm>", "Package manager: npm | pnpm | yarn | bun")
    .option("--preset <preset>", "Package version preset: enterprise | latest | stable", "enterprise")
    .option(
      "--pkg <items...>",
      "Override specific package versions (e.g. --pkg react@19.2.3 --pkg next@16.1.1)"
    )
    .option("--package-versions <json>", "Override multiple package versions via JSON string")
    .option("--fetch-latest", "Dynamically query npm registry live for bleeding-edge versions", false)
    .option("--install", "Automatically install dependencies", false)
    .option("--no-git", "Skip git repository initialization")
    .option("-y, --yes", "Skip interactive prompts and use defaults", false);

  return program;
}

export function parseCliOptions(program: Command, argv = process.argv): {
  projectName?: string;
  options: Partial<CLIOptions>;
} {
  program.parse(argv);
  const args = program.args;
  const opts = program.opts();

  const projectName = args[0] || opts.projectName;

  const options: Partial<CLIOptions> = {
    name: projectName,
    framework: opts.framework as Framework,
    language: opts.language as Language,
    architecture: opts.architecture,
    folders: opts.folders as ProjectFolder[],
    integrations: opts.integrations as Integration[],
    packageManager: opts.packageManager as PackageManager,
    preset: opts.preset as VersionPreset,
    pkg: opts.pkg,
    packageVersions: opts.packageVersions,
    fetchLatest: opts.fetchLatest,
    install: opts.install,
    git: opts.git,
    yes: opts.yes,
  };

  return { projectName, options };
}
