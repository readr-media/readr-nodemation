import {
  type DatabaseEnv,
  resolveDatabaseUrl,
} from "@/lib/prisma-environment";

// Resolve DATABASE_URL and pass it through. Safe to import at build time:
// when DATABASE_URL is unset no assignment is made and no error is thrown.
const databaseUrl = resolveDatabaseUrl(process.env as DatabaseEnv);

if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}
