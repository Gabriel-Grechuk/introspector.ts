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

const number_regex = /int|numeric|double|real/g;
const string_regex = /char|text|uuid|USER/g;
const obj_regex = /jsonb|json/g;
const boolean_regex = /boolean/g;
const date_regex = /time|date/g;

function postgresTypeInference(type_str: string): string {
  if (!type_str) return "string";

  if (type_str.match(number_regex)) return "number";
  else if (type_str.match(string_regex)) return "string";
  else if (type_str.match(boolean_regex)) return "boolean";
  else if (type_str.match(date_regex)) return "Date";
  else if (type_str.match(obj_regex)) return "unknown";
  else return type_str;
}

export async function getPostgresDatabasesSchema(args: {
  databases: Record<string, knex.Knex>;
  tablesToIgnore: string[];
}): Promise<Record<string, Record<string, Record<string, string>>>> {
  const dbTables: Record<string, any> = {};

  for (const db of Object.keys(args.databases)) {
    const tables = await args.databases[db]!("pg_tables")
      .select("tablename")
      .where("schemaname", "public");
    Object.assign(dbTables, {
      [db]: tables
        .map((reg: any) => reg.tablename)
        .filter((table: string) => !args.tablesToIgnore.includes(table)),
    });
  }

  const dbTablesWithColumns: Record<string, any> = {};
  for (const db of Object.keys(dbTables)) {
    Object.assign(dbTablesWithColumns, { [db]: {} });
    for (const table of dbTables[db]) {
      const columnInfo = await args.databases[db]!(table).columnInfo();

      Object.keys(columnInfo).forEach((key) => {
        Object.assign(dbTablesWithColumns[db], {
          [table]: {
            ...dbTablesWithColumns[db][table],
            [key]: postgresTypeInference(columnInfo[key]!.type),
          },
        });
      });
    }
  }

  return dbTablesWithColumns;
}
