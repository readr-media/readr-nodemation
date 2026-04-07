import fs from "node:fs";
import path from "node:path";

export const DEFAULT_SQLITE_DATABASE_PATH = "./data/workflow.db";

export type DatabaseEnv = {
  DATABASE_PATH?: string;
  DATABASE_URL?: string;
};

export const resolveDatabaseUrl = ({
  DATABASE_PATH,
  DATABASE_URL,
}: DatabaseEnv): string =>
  DATABASE_URL || `file:${DATABASE_PATH || DEFAULT_SQLITE_DATABASE_PATH}`;

export const ensureSqliteDirectory = (
  databaseUrl: string,
  cwd = process.cwd(),
): void => {
  if (!databaseUrl.startsWith("file:")) {
    return;
  }

  const sqlitePath = databaseUrl.slice("file:".length);

  if (!sqlitePath || sqlitePath === ":memory:") {
    return;
  }

  if (sqlitePath.startsWith("file:")) {
    return;
  }

  const resolvedPath = path.isAbsolute(sqlitePath)
    ? sqlitePath
    : path.resolve(cwd, sqlitePath);

  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
};
