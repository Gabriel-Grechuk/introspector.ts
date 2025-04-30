# introspector.ts

Simple CLI tool to generate TypeScript intefaces from database tables.

## Requirements

- [`mise`](https://mise.jdx.dev/getting-started.html)

## Build

Install the `bun` with `mise` and run the `build.sh` script.

```bash
mise install
sh ./build.sh
```

This will create a `./out` directory with the binary file. The name is `introspector-ts` by default, but you are able to change any build parameters by editing the `build.sh` file.

## Usage

Example:

```bash
./instrospector-ts -d "postgres://user:password@host:port/database_to_introspect" -e "ignore_this_table" -o "./interfaces/output"
```

```bash
./introspector-ts --database "postgres://user:password@host:port/database_to_introspect" --database "postgres://user:password@host:port/another_database_to_introspect" --exclude_table "_prisma_migrations" --exclude_table "ignore_this_other_table" --outdir ./
```

### Args

`--database` (`-d`): Specify the database that the generator should introspect. You can specify multiple databases.

`--exclude_table` (`-e`): Specify the tables that shouldn't be written as interface. You can specify multiple databases to be ignored.

`--outdir` (`-o`): Specify where the interfaces files should be written. You can specify only one directory. The default is `./`.

`--ssh`: Specify if the connection should ignore the SSL validation. Try it if you face any SSL related problems, but keep in mind that it may be unsafe.
