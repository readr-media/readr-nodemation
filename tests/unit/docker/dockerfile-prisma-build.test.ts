import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../../..");
const dockerfilePath = path.join(repoRoot, "Dockerfile");

describe("Dockerfile prisma build setup", () => {
  it("copies prisma schema before running pnpm install", () => {
    const dockerfile = fs.readFileSync(dockerfilePath, "utf8");

    const prismaCopyIndex = dockerfile.indexOf("COPY prisma ./prisma");
    const installIndex = dockerfile.indexOf(
      "RUN corepack enable && pnpm install --frozen-lockfile",
    );

    expect(prismaCopyIndex).toBeGreaterThanOrEqual(0);
    expect(installIndex).toBeGreaterThan(prismaCopyIndex);
  });
});
