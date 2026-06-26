import { describe, expect, it } from "vitest";
import { formatJobStartedAt } from "@/lib/format-datetime";
import {
  buildJobStartedAtFilter,
  resolveJobDisplayName,
} from "@/lib/jobs";

describe("jobs helpers", () => {
  it("resolves display name with fallbacks", () => {
    expect(resolveJobDisplayName("快照名稱", "工作流名稱")).toBe("快照名稱");
    expect(resolveJobDisplayName(null, "工作流名稱")).toBe("工作流名稱");
    expect(resolveJobDisplayName(undefined, null)).toBe("未命名工作流");
  });

  it("returns undefined filter for all time ranges", () => {
    expect(buildJobStartedAtFilter("all")).toBeUndefined();
    expect(buildJobStartedAtFilter("unknown")).toBeUndefined();
  });

  it("builds today filter in Taipei timezone", () => {
    const now = new Date("2026-06-23T08:30:00.000Z");
    const filter = buildJobStartedAtFilter("today", now);

    expect(filter?.gte).toBeInstanceOf(Date);
    expect(filter?.lte).toBeInstanceOf(Date);
    expect(filter!.gte!.getTime()).toBeLessThanOrEqual(filter!.lte!.getTime()!);
  });

  it("builds rolling day filters", () => {
    const now = new Date("2026-06-23T08:30:00.000Z");
    const filter = buildJobStartedAtFilter("7d", now);

    expect(filter?.gte).toBeInstanceOf(Date);
    expect(filter?.lte).toBeInstanceOf(Date);

    const diffDays =
      (filter!.lte!.getTime() - filter!.gte!.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(6);
    expect(diffDays).toBeLessThan(8);
  });

  it("formats started_at without seconds", () => {
    expect(formatJobStartedAt("2026-06-23T08:30:00.000Z")).toMatch(
      /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/,
    );
    expect(formatJobStartedAt(null)).toBeNull();
  });
});
