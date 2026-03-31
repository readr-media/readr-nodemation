import {
  type DatabaseEnv,
  ensureSqliteDirectory,
  resolveDatabaseUrl,
} from "@/lib/prisma-environment";

const databaseUrl = resolveDatabaseUrl(process.env as DatabaseEnv);

process.env.DATABASE_URL = databaseUrl;
ensureSqliteDirectory(databaseUrl);

export {};
