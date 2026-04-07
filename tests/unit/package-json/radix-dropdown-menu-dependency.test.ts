import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../../..");
const packageJsonPath = path.join(repoRoot, "package.json");

type PackageJson = {
  dependencies?: Record<string, string>;
};

describe("dropdown menu dependencies", () => {
  it("declares @radix-ui/react-dropdown-menu", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf8"),
    ) as PackageJson;

    expect(packageJson.dependencies).toHaveProperty(
      "@radix-ui/react-dropdown-menu",
    );
  });
});
