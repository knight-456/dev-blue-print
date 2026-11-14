import path from "node:path";
import pc from "picocolors";
import * as p from "@clack/prompts";
import { createCliCommand, parseCliOptions } from "./options.js";
import { runInteractivePrompts } from "./prompts.js";
import { resolveConfiguration } from "../config/resolver.js";
import { generateProject } from "../generator/project-generator.js";
import { logger } from "../utils/logger.js";
import { getRunCommand } from "../utils/package-manager.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function run(): Promise<void> {
  logger.banner();

  const program = createCliCommand();
  const { projectName, options } = parseCliOptions(program);

  let promptConfig = {};

  const isNonInteractive =
    options.yes ||
    (options.framework && options.language && options.integrations);

  if (!isNonInteractive) {
    promptConfig = await runInteractivePrompts(projectName);
  }

  const config = resolveConfiguration(options, promptConfig);

  console.log();
  const spinner = p.spinner();

  try {
    // Stage 1: Resolving
    spinner.start(
      `Resolving architecture (${config.framework} + ${config.language} | preset: ${config.preset})...`
    );
    await sleep(200);

    // Stage 2: Scaffolding
    spinner.message(
      `Scaffolding ${pc.cyan(config.projectName)} with ${config.folders.length} modular folders...`
    );

    const result = await generateProject(config);

    if (!result.success) {
      spinner.stop(pc.red("✖ Scaffolding failed"));
      logger.error("Configuration errors:");
      for (const err of result.errors) {
        console.error(pc.red(`  - ${err}`));
      }
      process.exit(1);
    }

    spinner.stop(pc.green("✔ Project scaffolded successfully!"));

    if (result.warnings.length > 0) {
      console.log();
      for (const warn of result.warnings) {
        logger.warn(warn);
      }
    }

    // Success summary card inspired by create-next-app and React Native CLI
    console.log();
    p.note(
      [
        `${pc.bold("Project:")}       ${pc.cyan(config.projectName)}`,
        `${pc.bold("Framework:")}     ${pc.cyan(config.framework.toUpperCase())}`,
        `${pc.bold("Language:")}      ${pc.cyan(config.language.toUpperCase())}`,
        `${pc.bold("Preset:")}        ${pc.cyan(config.preset)}`,
        `${pc.bold("Modules:")}       ${pc.cyan(`${config.folders.length} folders included`)}`,
        `${pc.bold("Location:")}      ${pc.dim(result.targetDir)}`,
      ].join("\n"),
      "Blueprint Architecture Configured"
    );

    const relativeTarget = path.relative(process.cwd(), result.targetDir);
    const cdCmd = relativeTarget ? `cd ${relativeTarget}` : "";

    console.log();
    console.log(
      pc.bold(pc.green("Success! ")) +
        `Created ${pc.bold(config.projectName)} at ${pc.dim(result.targetDir)}`
    );
    console.log();
    console.log("Inside that directory, you can run several commands:");
    console.log();
    console.log(`  ${pc.cyan(getRunCommand(config.packageManager, "dev"))}`);
    console.log(`    Starts the development server.`);
    console.log();
    console.log(`  ${pc.cyan(getRunCommand(config.packageManager, "build"))}`);
    console.log(`    Bundles the app for production.`);
    console.log();
    console.log(`  ${pc.cyan(getRunCommand(config.packageManager, "test"))}`);
    console.log(`    Runs the test runner with Vitest / Jest.`);
    console.log();
    console.log("We suggest that you begin by typing:");
    console.log();
    if (cdCmd) {
      console.log(`  ${pc.cyan(cdCmd)}`);
    }
    if (!config.installDeps) {
      console.log(`  ${pc.cyan(`${config.packageManager} install`)}`);
    }
    console.log(`  ${pc.cyan(getRunCommand(config.packageManager, "dev"))}`);
    console.log();
    p.outro(pc.bold(pc.magenta("Happy hacking with DevBlueprint! 🚀")));
  } catch (error: any) {
    spinner.stop(pc.red("✖ Error encountered during scaffolding."));
    logger.error(error?.message || String(error));
    process.exit(1);
  }
}

// Auto-execute if run as script
if (process.argv[1] && process.argv[1].endsWith("cli.js")) {
  run().catch((err) => {
    logger.error(err.message || String(err));
    process.exit(1);
  });
}
