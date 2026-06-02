import { describe, expect, it } from "vitest";

import { buildPersistPayload } from "@/lib/build-persist-payload";

const FIXED_NOW = new Date("2026-06-02T05:00:00.000Z");
const fixedNow = () => FIXED_NOW;

describe("buildPersistPayload — save action", () => {
  it("sets status to draft on save (new workflow)", () => {
    const out = buildPersistPayload("save", {
      scheduledNextRunAt: null,
      now: fixedNow,
    });
    expect(out).toEqual({ status: "draft", nextRunAt: null });
  });

  it("demotes the workflow to draft on save (pauses any active schedule)", () => {
    // Per PRD: 儲存 is a pure form save and should never leave the workflow
    // in a worker-eligible state. Even if it was already published with a
    // future scheduled run, saving demotes it back to draft.
    const out = buildPersistPayload("save", {
      scheduledNextRunAt: "2026-06-03T00:00:00.000Z",
      now: fixedNow,
    });
    expect(out.status).toBe("draft");
  });

  it("preserves the schedule's nextRunAt on save (kept in sync with schedule UI)", () => {
    // status='draft' already makes the row worker-ineligible regardless of
    // next_run_at; we pass through whatever the schedule store computed so
    // the UI state stays internally consistent.
    const out = buildPersistPayload("save", {
      scheduledNextRunAt: "2026-06-03T00:00:00.000Z",
      now: fixedNow,
    });
    expect(out.nextRunAt).toBe("2026-06-03T00:00:00.000Z");
  });

  it("never sets next_run_at to NOW on save", () => {
    const out = buildPersistPayload("save", {
      scheduledNextRunAt: null,
      now: fixedNow,
    });
    expect(out.nextRunAt).not.toBe(FIXED_NOW.toISOString());
  });
});

describe("buildPersistPayload — run action", () => {
  it("promotes the workflow to published", () => {
    const out = buildPersistPayload("run", {
      scheduledNextRunAt: null,
      now: fixedNow,
    });
    expect(out.status).toBe("published");
  });

  it("overrides next_run_at to NOW so the worker picks it up on the next tick", () => {
    const out = buildPersistPayload("run", {
      scheduledNextRunAt: "2026-06-03T00:00:00.000Z",
      now: fixedNow,
    });
    // Schedule's nextRunAt is overridden — run means run now.
    expect(out.nextRunAt).toBe(FIXED_NOW.toISOString());
  });

  it("uses wall clock when no now() is injected", () => {
    const out = buildPersistPayload("run", {
      scheduledNextRunAt: null,
    });
    expect(out.nextRunAt).not.toBeNull();
    const parsed = Date.parse(out.nextRunAt!);
    expect(Number.isNaN(parsed)).toBe(false);
    expect(Math.abs(parsed - Date.now())).toBeLessThan(5_000);
  });
});
