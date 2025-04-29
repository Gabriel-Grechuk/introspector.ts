import { parseCliArgs } from "./cli";
import {
  getPostgresDatabasesSchema,
  instancePostgresDatabases,
} from "./implementations/postgres";
import { genFileText, snakeToPascal, writeFile } from "./tools";
import * as logging from "./logging";

async function main() {
  try {
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
  } catch (error) {
    console.log("Error:", error);
  }
}

await main().then(() => {
  logging.infoLog("All done! Exiting...");
  process.exit(0);
});
