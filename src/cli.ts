import type { Args } from "./types/cli.types";
import { parseArgs } from "util";

export function parseCliArgs(): Args {
  const { values } = parseArgs({
    args: Bun.argv.slice(2), // Remove bun bin and script paths.
    options: {
      database: {
        short: "d",
        type: "string",
        multiple: true,
      },

      ssh: {
        type: "boolean",
      },
    },
    allowNegative: true,
    allowPositionals: true,
    strict: true,
  });

  console.log("values:", values);

  return {
    databases: {},
  };
}
