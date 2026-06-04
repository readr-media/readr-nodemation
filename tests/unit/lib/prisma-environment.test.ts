import { describe, expect, it, vi } from "vitest";
import { resolveDatabaseUrl } from "@/lib/prisma-environment";

describe("resolveDatabaseUrl", () => {
  it("returns DATABASE_URL when it is set", () => {
    const url =
      "postgresql://ndx:ndx@localhost:5433/workflow?schema=public";
    expect(resolveDatabaseUrl({ DATABASE_URL: url })).toBe(url);
  });

  it("throws when DATABASE_URL is not set", () => {
    expect(() => resolveDatabaseUrl({})).toThrow("DATABASE_URL is not set");
  });

  it("throws when DATABASE_URL is an empty string", () => {
    expect(() => resolveDatabaseUrl({ DATABASE_URL: "" })).toThrow(
      "DATABASE_URL is not set",
    );
  });

  it("sets DATABASE_URL when prisma environment bootstrap module is loaded", async () => {
    const previousDatabaseUrl = process.env.DATABASE_URL;

    process.env.DATABASE_URL =
      "postgresql://ndx:ndx@localhost:5433/workflow?schema=public";

    vi.resetModules();
    await import("../../../lib/load-prisma-environment.ts");

    expect(process.env.DATABASE_URL).toBe(
      "postgresql://ndx:ndx@localhost:5433/workflow?schema=public",
    );

    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }
  });
});
