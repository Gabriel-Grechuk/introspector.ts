import { parseArgs } from "util";
import type {
  Args,
  DatabaseDescrition,
  SupportedDatabases,
} from "./types/cli.types";
import * as loggin from "./logging";
import { argv } from "process";

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

function printHelp() {
  console.log(
    loggin.format("introspector-ts", ["bold", "bg_green"]),
    `
Usage axample:
./instrospector-ts -d "postgres://user:password@host:port/database_to_introspect" -e "ignore_this_table" -o "./interfaces/output"

./introspector-ts --database "postgres://user:password@host:port/database_to_introspect" --database "postgres://user:password@host:port/another_database_to_introspect" --exclude_table "_prisma_migrations" --exclude_table "ignore_this_other_table" --outdir ./

Args:
${loggin.format("--database", ["blue"])} (${loggin.format("-d", ["blue"])}):
    Specify the database that the generator should introspect. You can specify
    multiple databases.

${loggin.format("--exclude_table", ["blue"])} (${loggin.format("-e", ["blue"])}):
    Specify the tables that shouldn't be written as interface. You can specify
    multiple databases to be ignored.

${loggin.format("--outdir", ["blue"])} (${loggin.format("-o", ["blue"])}):
    Specify where the interfaces files should be written. You can specify only
    one directory. The default is ./.

${loggin.format("--ssl", ["blue"])}:
    Specify if the connection should ignore the SSL validation. Try it if you
    face any SSL related problems, but keep in mind that it may be unsafe.
`,
  );
}

export function parseCliArgs(): Args {
  if (Bun.argv.length <= 2) {
    printHelp();
    process.exit(0);
  }

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

      help: {
        short: "h",
        type: "boolean",
      },
    },

    allowPositionals: true,
    allowNegative: true,
  });

  if (values.help) {
    printHelp();
    process.exit(0);
  }

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
    exclude_tables: values.exclude_table ?? [],
    outdir: values.outdir ?? "",
    ssl: values.ssl ?? false,
  };
}
