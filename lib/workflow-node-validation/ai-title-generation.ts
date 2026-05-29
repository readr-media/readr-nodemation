export const AI_TITLE_GENERATION_FIELDS = {
  titleKeywords: "titleKeywords",
} as const;

export function validateTitleKeywordsInput(value: string): string | null {
  if (!value.trim()) return null;

  const keywords = value
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (keywords.length > 3) {
    return "關鍵字限輸入1-3個";
  }

  const totalLength = keywords.join("").length;
  if (totalLength > 20) {
    return "SEO 關鍵字總長度限 20 字以內";
  }

  return null;
}
