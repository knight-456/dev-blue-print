import pc from "picocolors";

export const logger = {
  info: (msg: string) => console.log(pc.cyan("ℹ ") + msg),
  success: (msg: string) => console.log(pc.green("✔ ") + pc.bold(msg)),
  warn: (msg: string) => console.log(pc.yellow("▲ ") + pc.yellow(msg)),
  error: (msg: string) => console.error(pc.red("✖ ") + pc.red(msg)),
  step: (step: number, total: number, msg: string) =>
    console.log(pc.cyan(`  [${step}/${total}] `) + pc.bold(msg)),

  banner: () => {
    console.log();
    console.log(
      pc.bold(
        pc.cyan("   ___             ___  _                       _       _   ")
      )
    );
    console.log(
      pc.bold(
        pc.cyan("  |   \\  ___ __ __| _ )| | _  _  ___  _ __  _ _ (_) _ _  | |_ ")
      )
    );
    console.log(
      pc.bold(
        pc.blue("  | |) |/ -_)\\ V /| _ \\| | | || |/ -_)| '_ \\| '_|| || ' \\ |  _|")
      )
    );
    console.log(
      pc.bold(
        pc.magenta("  |___/ \\___| \\_/ |___/|_|  \\_,_|\\___|| .__/|_|  |_||_||_| \\__|")
      )
    );
    console.log(
      pc.bold(
        pc.magenta("                                      |_|                      ")
      )
    );
    console.log(
      pc.dim("  Enterprise Scaffolding CLI for React, Vite & Next.js") +
        pc.cyan("  v1.0.0")
    );
    console.log(
      pc.gray("  ────────────────────────────────────────────────────────────")
    );
    console.log();
  },
};
