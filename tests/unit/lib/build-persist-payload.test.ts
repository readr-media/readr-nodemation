import { describe, expect, it } from "vitest";

import { buildPersistPayload } from "@/lib/build-persist-payload";

const FIXED_NOW = new Date("2026-06-02T05:00:00.000Z");
const fixedNow = () => FIXED_NOW;

describe("buildPersistPayload — save action", () => {
  it("preserves a draft workflow's status and schedule", () => {
    const out = buildPersistPayload("save", {
      currentStatus: "draft",
      scheduledNextRunAt: null,
      now: fixedNow,
    });
    expect(out).toEqual({ status: "draft", nextRunAt: null });
  });

  it("does NOT promote a published workflow back to draft (preserves schedule)", () => {
    const out = buildPersistPayload("save", {
      currentStatus: "published",
      scheduledNextRunAt: "2026-06-03T00:00:00.000Z",
      now: fixedNow,
    });
    expect(out).toEqual({
      status: "published",
      nextRunAt: "2026-06-03T00:00:00.000Z",
    });
  });

  it("never sets next_run_at to NOW on save", () => {
    const out = buildPersistPayload("save", {
      currentStatus: "draft",
      scheduledNextRunAt: null,
      now: fixedNow,
    });
    expect(out.nextRunAt).not.toBe(FIXED_NOW.toISOString());
  });
});

describe("buildPersistPayload — run action", () => {
  it("promotes any non-template status to published", () => {
    const out = buildPersistPayload("run", {
      currentStatus: "draft",
      scheduledNextRunAt: null,
      now: fixedNow,
    });
    expect(out.status).toBe("published");
  });

  it("overrides next_run_at to NOW so the worker picks it up on the next tick", () => {
    const out = buildPersistPayload("run", {
      currentStatus: "draft",
      scheduledNextRunAt: "2026-06-03T00:00:00.000Z",
      now: fixedNow,
    });
    // Schedule's nextRunAt is overridden — run means run now.
    expect(out.nextRunAt).toBe(FIXED_NOW.toISOString());
  });

  it("uses wall clock when no now() is injected", () => {
    const out = buildPersistPayload("run", {
      currentStatus: "draft",
      scheduledNextRunAt: null,
    });
    // Loose check: it's a valid ISO string close to now.
    expect(out.nextRunAt).not.toBeNull();
    const parsed = Date.parse(out.nextRunAt!);
    expect(Number.isNaN(parsed)).toBe(false);
    expect(Math.abs(parsed - Date.now())).toBeLessThan(5_000);
  });
});
