import { describe, expect, it } from "vitest";
import { renameClipboardItem } from "../electron/services/clipboard";
import { createInitialData } from "../src/shared/defaults";

describe("clipboard item names", () => {
  it("stores a trimmed display name on a clipboard item", () => {
    const data = {
      ...createInitialData(),
      clipboardItems: [
        {
          id: "clip-1",
          text: "https://api-docs.deepseek.com/zh-cn/",
          pinned: true,
          createdAt: "2026-05-21T00:00:00.000Z",
          lastCopiedAt: "2026-05-21T00:00:00.000Z"
        }
      ]
    };

    const next = renameClipboardItem(data, "clip-1", "  DeepSeek API docs  ");

    expect(next.clipboardItems[0].title).toBe("DeepSeek API docs");
  });

  it("clears the display name when the name is empty", () => {
    const data = {
      ...createInitialData(),
      clipboardItems: [
        {
          id: "clip-1",
          text: "https://api-docs.deepseek.com/zh-cn/",
          title: "DeepSeek API docs",
          pinned: true,
          createdAt: "2026-05-21T00:00:00.000Z",
          lastCopiedAt: "2026-05-21T00:00:00.000Z"
        }
      ]
    };

    const next = renameClipboardItem(data, "clip-1", "  ");

    expect(next.clipboardItems[0].title).toBeUndefined();
  });
});
