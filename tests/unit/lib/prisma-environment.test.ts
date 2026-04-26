import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SQLITE_DATABASE_PATH,
  ensureSqliteDirectory,
  resolveDatabaseUrl,
} from "@/lib/prisma-environment";

describe("resolveDatabaseUrl", () => {
  it("returns DATABASE_URL when it is explicitly provided", () => {
    expect(
      resolveDatabaseUrl({
        DATABASE_URL: "file:./data/custom.db",
        DATABASE_PATH: "./data/workflow.db",
      }),
    ).toBe("file:./data/custom.db");
  });

  it("falls back to DATABASE_PATH when DATABASE_URL is missing", () => {
    expect(
      resolveDatabaseUrl({
        DATABASE_PATH: "./data/from-path.db",
      }),
    ).toBe("file:./data/from-path.db");
  });

  it("uses the default sqlite path when no database env is set", () => {
    expect(resolveDatabaseUrl({})).toBe(`file:${DEFAULT_SQLITE_DATABASE_PATH}`);
  });

  it("creates the parent directory for a sqlite file URL", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "prisma-env-"));
    const databaseUrl = "file:./data/test.db";

    ensureSqliteDirectory(databaseUrl, tempRoot);

    expect(fs.existsSync(path.join(tempRoot, "data"))).toBe(true);
  });

  it("sets DATABASE_URL when prisma environment bootstrap module is loaded", async () => {
    const previousDatabaseUrl = process.env.DATABASE_URL;
    const previousDatabasePath = process.env.DATABASE_PATH;

    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_PATH;

    vi.resetModules();
    await import("../../../lib/load-prisma-environment.ts");

    expect(process.env.DATABASE_URL).toBe(
      `file:${DEFAULT_SQLITE_DATABASE_PATH}`,
    );

    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }

    if (previousDatabasePath === undefined) {
      delete process.env.DATABASE_PATH;
    } else {
      process.env.DATABASE_PATH = previousDatabasePath;
    }
  });

  it("loads the prisma module without a preconfigured DATABASE_URL", async () => {
    const previousDatabaseUrl = process.env.DATABASE_URL;
    const previousDatabasePath = process.env.DATABASE_PATH;

    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_PATH;

    vi.resetModules();
    const prismaModule = await import("../../../lib/prisma.ts");

    expect(prismaModule.prisma).toBeDefined();
    expect(process.env.DATABASE_URL).toBe(
      `file:${DEFAULT_SQLITE_DATABASE_PATH}`,
    );

    await prismaModule.prisma.$disconnect();

    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }

    if (previousDatabasePath === undefined) {
      delete process.env.DATABASE_PATH;
    } else {
      process.env.DATABASE_PATH = previousDatabasePath;
    }
  });
});
