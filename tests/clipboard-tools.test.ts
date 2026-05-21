import { describe, expect, it } from "vitest";
import {
  classifyClipboardText,
  searchClipboardItems
} from "../src/shared/clipboardTools";
import type { ClipboardItem } from "../src/shared/types";

const item = (text: string, pinned = false): ClipboardItem => ({
  id: text,
  text,
  pinned,
  createdAt: "2026-05-21T00:00:00.000Z",
  lastCopiedAt: "2026-05-21T00:00:00.000Z"
});

describe("clipboard tools", () => {
  it("classifies links, code, text, and other content", () => {
    expect(classifyClipboardText("https://example.com")).toBe("link");
    expect(classifyClipboardText("const total = price + tax;")).toBe("code");
    expect(classifyClipboardText("一段普通中文内容")).toBe("text");
    expect(classifyClipboardText("")).toBe("other");
  });

  it("searches clipboard text and derived category labels", () => {
    const items = [item("https://openai.com"), item("普通文本"), item("const value = 1;", true)];

    expect(searchClipboardItems(items, "openai", "all").map((entry) => entry.text)).toEqual(["https://openai.com"]);
    expect(searchClipboardItems(items, "", "favorite").map((entry) => entry.text)).toEqual(["const value = 1;"]);
    expect(searchClipboardItems(items, "代码", "all").map((entry) => entry.text)).toEqual(["const value = 1;"]);
  });
});
