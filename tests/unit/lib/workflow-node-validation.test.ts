import { describe, expect, it } from "vitest";

import {
  hasWorkflowInputErrors,
  validateCategoryAmountInput,
  validateTagAmountInput,
} from "@/lib/workflow-node-validation";

describe("workflow node validation", () => {
  it("validates ai classifier tagger category amount input", () => {
    expect(validateCategoryAmountInput("1")).toBeNull();
    expect(validateCategoryAmountInput("3")).toBeNull();
    expect(validateCategoryAmountInput("")).toBe("請輸入 1-3 的數字");
    expect(validateCategoryAmountInput("abc")).toBe("請輸入 1-3 的數字");
    expect(validateCategoryAmountInput("1.5")).toBe("請輸入 1-3 的數字");
    expect(validateCategoryAmountInput("0")).toBe("只能產生 1-3 個分類");
    expect(validateCategoryAmountInput("4")).toBe("只能產生 1-3 個分類");
  });

  it("validates ai classifier tagger tag amount input", () => {
    expect(validateTagAmountInput("10")).toBeNull();
    expect(validateTagAmountInput("")).toBe("請輸入 1-10 的數字");
    expect(validateTagAmountInput("29")).toBe("只能產生 1-10 個標籤");
  });

  it("detects pending node field errors", () => {
    expect(hasWorkflowInputErrors({})).toBe(false);
    expect(
      hasWorkflowInputErrors({
        "node-1": { categoryAmount: "只能產生 1-3 個分類" },
      }),
    ).toBe(true);
  });
});
