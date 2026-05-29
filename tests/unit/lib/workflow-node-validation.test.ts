import { describe, expect, it } from "vitest";

import {
  hasWorkflowInputErrors,
  validateCategoryAmountInput,
  validateTagAmountInput,
  validateTitleKeywordsInput,
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

  it("validates ai title generation keywords input", () => {
    expect(validateTitleKeywordsInput("")).toBeNull();
    expect(validateTitleKeywordsInput("   ")).toBeNull();
    expect(validateTitleKeywordsInput("AI")).toBeNull();
    expect(validateTitleKeywordsInput("AI,新聞")).toBeNull();
    expect(validateTitleKeywordsInput("AI,新聞,ETF")).toBeNull();
    expect(validateTitleKeywordsInput("AI,新聞,ETF,台股")).toBe(
      "關鍵字限輸入1-3個",
    );
    expect(validateTitleKeywordsInput("一二三四五六七八九十一二三四五六七八九十一")).toBe(
      "SEO 關鍵字總長度限 20 字以內",
    );
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
