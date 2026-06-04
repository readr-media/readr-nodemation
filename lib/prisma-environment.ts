export type DatabaseEnv = {
  DATABASE_URL?: string;
};

export const resolveDatabaseUrl = ({ DATABASE_URL }: DatabaseEnv): string => {
  if (!DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. " +
        "Provide a PostgreSQL connection string, e.g. " +
        "postgresql://USER:PASSWORD@HOST/DBNAME?schema=public",
    );
  }
  return DATABASE_URL;
};
