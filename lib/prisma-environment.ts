export type DatabaseEnv = {
  DATABASE_URL?: string;
};

// Returns DATABASE_URL when set, or undefined when unset.
// Does not throw — missing URL at build time is normal; Prisma surfaces
// its own error at query time if the URL is absent at runtime.
export const resolveDatabaseUrl = ({
  DATABASE_URL,
}: DatabaseEnv): string | undefined => DATABASE_URL || undefined;
