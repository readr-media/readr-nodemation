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

  it("throws at bootstrap when DATABASE_URL is not set", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    vi.resetModules();
    await expect(
      import("../../../lib/load-prisma-environment.ts"),
    ).rejects.toThrow("DATABASE_URL is not set");
    if (prev !== undefined) process.env.DATABASE_URL = prev;
    else delete process.env.DATABASE_URL;
  });
});
