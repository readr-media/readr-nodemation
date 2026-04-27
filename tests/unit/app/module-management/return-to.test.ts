import { describe, expect, it } from "vitest";

import { getSafeReturnTo } from "@/app/module-management/_components/return-to";

describe("getSafeReturnTo", () => {
  it("returns a valid in-site relative path", () => {
    expect(getSafeReturnTo("/dashboard")).toBe("/dashboard");
  });

  it("returns / for an empty value", () => {
    expect(getSafeReturnTo("")).toBe("/");
  });

  it("returns / when the value is missing", () => {
    expect(getSafeReturnTo(null)).toBe("/");
  });

  it("returns / for an absolute external URL", () => {
    expect(getSafeReturnTo("https://example.com")).toBe("/");
  });

  it("returns / for a protocol-relative URL", () => {
    expect(getSafeReturnTo("//example.com")).toBe("/");
  });

  it("returns / for a slash-backslash protocol-relative URL", () => {
    expect(getSafeReturnTo("/\\example.com")).toBe("/");
  });

  it("returns / for a non-path string", () => {
    expect(getSafeReturnTo("dashboard")).toBe("/");
  });
});
