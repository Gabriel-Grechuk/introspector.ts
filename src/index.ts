import { parseCliArgs } from "./cli";
import {
  getPostgresDatabasesSchema,
  instancePostgresDatabases,
} from "./implementations/postgres";
import { genFileText, snakeToPascal, writeFile } from "./tools";
import * as logging from "./logging";

async function main() {
  const args = parseCliArgs();
  const instances = instancePostgresDatabases({
    databases: args.databases,
    ssl: args.ssl,
  });
  const schemas = await getPostgresDatabasesSchema({
    databases: instances,
    tablesToIgnore: args.exclude_tables,
  });

  const writeInterfacesPromises = Object.keys(schemas).map((field) => {
    return writeFile(
      `${args.outdir ?? "."}/${snakeToPascal(field)}.interfaces.ts`,
      genFileText(schemas[field]!),
    );
  });

  await Promise.all(writeInterfacesPromises);
}

await main()
  .then(() => {
    logging.infoLog("All done! Exiting...");
    process.exit(0);
  })
  .catch((error) => {
    logging.errorLog("Something whent wrong, exiting on error:", error);
    process.exit(1);
  });
