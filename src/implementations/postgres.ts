import { knex } from "knex";
import type { DatabaseDescrition } from "../types/cli.types";
import * as logging from "../logging";

export function instancePostgresDatabases(args: {
  databases: DatabaseDescrition;
  ssl: boolean;
}): Record<string, knex.Knex> {
  const res = {};

  for (const db of Object.keys(args.databases)) {
    if (args.databases[db]?.type != "postgresql") {
      logging.warningLog(
        `${db} is not a PostgreSQL database. It will be ignored...`,
      );
      continue;
    }

    Object.assign(res, {
      [db]: knex({
        client: "pg",
        connection: {
          connectionString: args.databases[db]?.url,
          ssl: args.ssl && {
            rejectUnauthorized: false,
          },
        },
      }).on("query", (query: any) =>
        logging.queryLog(`[${db}] Running:`, query.sql),
      ),
    });
  }

  return res;
}
