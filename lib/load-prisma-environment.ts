import {
  type DatabaseEnv,
  resolveDatabaseUrl,
} from "@/lib/prisma-environment";

// Resolve and validate DATABASE_URL before PrismaClient is constructed.
const databaseUrl = resolveDatabaseUrl(process.env as DatabaseEnv);

process.env.DATABASE_URL = databaseUrl;
