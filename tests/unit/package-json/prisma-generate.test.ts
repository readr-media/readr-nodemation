import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../../..");
const packageJsonPath = path.join(repoRoot, "package.json");

type PackageJson = {
  scripts?: Record<string, string>;
};

const getPackageJson = (): PackageJson =>
  JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson;

describe("package installation setup", () => {
  it("runs prisma generate after dependencies are installed", () => {
    const packageJson = getPackageJson();

    expect(packageJson.scripts?.postinstall).toContain("prisma generate");
  });
});
