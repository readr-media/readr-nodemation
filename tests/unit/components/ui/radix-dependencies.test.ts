import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../../../..");
const uiDirectory = path.join(repoRoot, "components/ui");
const packageJsonPath = path.join(repoRoot, "package.json");

const radixImportPattern = /from\s+["'](@radix-ui\/[^"']+)["']/g;

const getDeclaredDependencies = () => {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  return new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ]);
};

const getRadixImports = () => {
  const files = fs
    .readdirSync(uiDirectory)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));

  return new Set(
    files.flatMap((file) => {
      const source = fs.readFileSync(path.join(uiDirectory, file), "utf8");
      return [...source.matchAll(radixImportPattern)].map((match) => match[1]);
    }),
  );
};

describe("ui package dependencies", () => {
  it("declares every imported Radix package in package.json", () => {
    const declaredDependencies = getDeclaredDependencies();
    const radixImports = getRadixImports();

    expect(
      [...radixImports].filter((pkg) => !declaredDependencies.has(pkg)),
    ).toEqual([]);
  });
});
