import { parseArgs } from "util";
import type {
  Args,
  DatabaseDescrition,
  SupportedDatabases,
} from "./types/cli.types";
import * as loggin from "./logging";

function parseDatabaseString(input: string):
  | {
      databaseType: SupportedDatabases;
      databaseName: string;
      databaseUrl: string;
    }
  | undefined {
  const normalizedInput = input.trim().toLowerCase();

  // Parse for postgres.
  if (normalizedInput.startsWith("postgresql://")) {
    const dbName = normalizedInput.split("/")[3]?.split(/\?/)[0];
    if (!dbName) {
      loggin.warningLog(
        `Database URL does not include the desired database name. It will be ignored: "${input}"`,
      );
      return;
    }

    return {
      databaseName: dbName,
      databaseType: "postgresql",
      databaseUrl: normalizedInput,
    };
  }

  loggin.warningLog(
    `Invalid or unsupported database URL. It will be ignored: "${input}"`,
  );
}

export function parseCliArgs(): Args {
  const { values } = parseArgs({
    args: Bun.argv.slice(2), // Remove bun bin and script paths.
    options: {
      database: {
        short: "d",
        type: "string",
        multiple: true,
      },

      exclude_table: {
        short: "e",
        type: "string",
        multiple: true,
      },

      outdir: {
        short: "o",
        type: "string",
      },

      ssl: {
        type: "boolean",
      },
    },
    allowPositionals: true,
    allowNegative: true,
  });

  const databases: DatabaseDescrition = {};

  for (const connectionString of values.database ?? []) {
    const parsedDatabaseDescription = parseDatabaseString(connectionString);
    if (!parsedDatabaseDescription) continue;
    Object.assign(databases, {
      [parsedDatabaseDescription.databaseName]: {
        type: parsedDatabaseDescription.databaseType,
        url: parsedDatabaseDescription.databaseUrl,
      },
    });
  }

  return {
    databases,
    exclude_tables: values.excude_table ?? [],
    outdir: values.outdir ?? "",
    ssl: values.ssl ?? false,
  };
}
