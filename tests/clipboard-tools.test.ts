import { describe, expect, it } from "vitest";
import { classifyClipboardText, searchClipboardItems } from "../src/shared/clipboardTools";
import type { ClipboardItem } from "../src/shared/types";

const item = (text: string, pinned = false, title?: string): ClipboardItem => ({
  id: text,
  text,
  title,
  pinned,
  createdAt: "2026-05-21T00:00:00.000Z",
  lastCopiedAt: "2026-05-21T00:00:00.000Z"
});

describe("clipboard tools", () => {
  it("classifies links, code, text, and other content", () => {
    expect(classifyClipboardText("https://example.com")).toBe("link");
    expect(classifyClipboardText("const total = price + tax;")).toBe("code");
    expect(classifyClipboardText("\u4e00\u6bb5\u666e\u901a\u4e2d\u6587\u5185\u5bb9")).toBe("text");
    expect(classifyClipboardText("")).toBe("other");
  });

  it("searches clipboard text and derived category labels", () => {
    const items = [
      item("https://openai.com"),
      item("\u666e\u901a\u6587\u672c"),
      item("const value = 1;", true)
    ];

    expect(searchClipboardItems(items, "openai", "all").map((entry) => entry.text)).toEqual(["https://openai.com"]);
    expect(searchClipboardItems(items, "", "favorite").map((entry) => entry.text)).toEqual(["const value = 1;"]);
    expect(searchClipboardItems(items, "\u4ee3\u7801", "all").map((entry) => entry.text)).toEqual([
      "const value = 1;"
    ]);
  });

  it("searches saved names for favorite items", () => {
    const items = [item("https://api-docs.deepseek.com/zh-cn/", true, "DeepSeek API docs")];

    expect(searchClipboardItems(items, "api docs", "favorite").map((entry) => entry.text)).toEqual([
      "https://api-docs.deepseek.com/zh-cn/"
    ]);
  });
});
