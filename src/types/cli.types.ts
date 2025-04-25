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
  outdir: string;
  ssh: boolean;
};
