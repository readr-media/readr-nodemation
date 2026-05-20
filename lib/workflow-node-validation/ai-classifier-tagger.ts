import { parsePositiveIntegerInput } from "./parse-positive-integer-input";

export const AI_CLASSIFIER_TAGGER_FIELDS = {
  categoryAmount: "categoryAmount",
  tagAmount: "tagAmount",
} as const;

export function validateCategoryAmountInput(value: string): string | null {
  const parsedValue = parsePositiveIntegerInput(value);

  if (parsedValue === null) {
    return "請輸入 1-3 的數字";
  }

  if (parsedValue < 1 || parsedValue > 3) {
    return "只能產生 1-3 個分類";
  }

  return null;
}

export function validateTagAmountInput(value: string): string | null {
  const parsedValue = parsePositiveIntegerInput(value);

  if (parsedValue === null) {
    return "請輸入 1-10 的數字";
  }

  if (parsedValue < 1 || parsedValue > 10) {
    return "只能產生 1-10 個標籤";
  }

  return null;
}
