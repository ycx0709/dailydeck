import type { ClipboardItem } from "./types.js";

export type ClipboardCategory = "all" | "favorite" | "link" | "code" | "text" | "other";

export const clipboardCategoryLabels: Record<ClipboardCategory, string> = {
  all: "\u5168\u90e8",
  favorite: "\u6536\u85cf",
  link: "\u94fe\u63a5",
  code: "\u4ee3\u7801",
  text: "\u6587\u672c",
  other: "\u5176\u4ed6"
};

const urlPattern = /^https?:\/\/\S+$/i;
const codePattern =
  /\b(const|let|var|function|return|import|export|class|interface|type|SELECT|UPDATE|INSERT)\b|[{}<>;]/;

export function classifyClipboardText(text: string): Exclude<ClipboardCategory, "all" | "favorite"> {
  const value = text.trim();
  if (!value) return "other";
  if (urlPattern.test(value)) return "link";
  if (codePattern.test(value)) return "code";
  if (/[\p{L}\p{N}]/u.test(value)) return "text";
  return "other";
}

export function removeLineBreaks(text: string): string {
  return text.replace(/\s*[\r\n]+\s*/g, " ").trim();
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function formatJsonText(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export function processClipboardText(
  text: string,
  operation: "removeLineBreaks" | "normalizeWhitespace" | "upper" | "lower" | "formatJson"
): string {
  switch (operation) {
    case "removeLineBreaks":
      return removeLineBreaks(text);
    case "normalizeWhitespace":
      return normalizeWhitespace(text);
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "formatJson":
      return formatJsonText(text);
  }
}

export function searchClipboardItems(
  items: ClipboardItem[],
  query: string,
  category: ClipboardCategory
): ClipboardItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    const itemCategory = classifyClipboardText(item.text);
    const categoryMatches =
      category === "all" ||
      (category === "favorite" && item.pinned) ||
      (category !== "favorite" && category === itemCategory);
    if (!categoryMatches) return false;
    if (!normalizedQuery) return true;

    const label = clipboardCategoryLabels[itemCategory].toLowerCase();
    return item.text.toLowerCase().includes(normalizedQuery) || label.includes(normalizedQuery);
  });
}
