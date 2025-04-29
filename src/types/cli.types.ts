export type SupportedDatabases = "postgresql";

export type DatabaseDescrition = Record<
  string,
  {
    type: SupportedDatabases;
    url: string;
  }
>;

export type Args = {
  databases: DatabaseDescrition;
  exclude_tables: string[];
  outdir: string;
  ssl: boolean;
};
