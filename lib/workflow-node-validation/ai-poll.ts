import { parsePositiveIntegerInput } from "./parse-positive-integer-input";

export const AI_POLL_FIELDS = {
  categoryAmount: "categoryAmount",
} as const;

export function validatePollOptionCountInput(value: string): string | null {
  const parsedValue = parsePositiveIntegerInput(value);

  if (parsedValue === null) {
    return "請輸入 2-10 的數字";
  }

  if (parsedValue < 2 || parsedValue > 10) {
    return "只能產生 2-10 個投票選項";
  }

  return null;
}
