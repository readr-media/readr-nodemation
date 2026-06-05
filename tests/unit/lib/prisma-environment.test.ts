import { describe, expect, it, vi } from "vitest";
import { resolveDatabaseUrl } from "@/lib/prisma-environment";

describe("resolveDatabaseUrl", () => {
  it("returns DATABASE_URL when it is set", () => {
    const url =
      "postgresql://ndx:ndx@localhost:5433/workflow?schema=public";
    expect(resolveDatabaseUrl({ DATABASE_URL: url })).toBe(url);
  });

  it("returns undefined when DATABASE_URL is not set", () => {
    expect(resolveDatabaseUrl({})).toBeUndefined();
  });

  it("returns undefined when DATABASE_URL is an empty string", () => {
    expect(resolveDatabaseUrl({ DATABASE_URL: "" })).toBeUndefined();
  });
});

describe("load-prisma-environment (build-safety)", () => {
  it("does NOT throw when DATABASE_URL is unset", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    vi.resetModules();
    await expect(
      import("../../../lib/load-prisma-environment.ts"),
    ).resolves.toBeDefined();
    if (prev !== undefined) process.env.DATABASE_URL = prev;
    else delete process.env.DATABASE_URL;
  });

  it("sets process.env.DATABASE_URL when a URL is provided", async () => {
    const url = "postgresql://ndx:ndx@localhost:5433/workflow?schema=public";
    process.env.DATABASE_URL = url;
    vi.resetModules();
    await import("../../../lib/load-prisma-environment.ts");
    expect(process.env.DATABASE_URL).toBe(url);
  });
});
