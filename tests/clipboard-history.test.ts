import { describe, expect, it } from "vitest";
import { addClipboardText, clearClipboardItems, setClipboardPinned } from "../electron/services/clipboard";
import { createInitialData } from "../src/shared/defaults";

describe("clipboard history operations", () => {
  it("does not add duplicate consecutive text", () => {
    const first = addClipboardText(createInitialData(), "hello", "2026-05-21T00:00:00.000Z");
    const second = addClipboardText(first, "hello", "2026-05-21T00:00:01.000Z");

    expect(second.clipboardItems).toHaveLength(1);
    expect(second.clipboardItems[0]?.lastCopiedAt).toBe("2026-05-21T00:00:01.000Z");
  });

  it("keeps pinned items when clearing unpinned history", () => {
    const data = addClipboardText(createInitialData(), "keep", "2026-05-21T00:00:00.000Z");
    const pinned = setClipboardPinned(data, data.clipboardItems[0]!.id, true);
    const withSecond = addClipboardText(pinned, "remove", "2026-05-21T00:00:01.000Z");

    const cleared = clearClipboardItems(withSecond, false);

    expect(cleared.clipboardItems.map((item) => item.text)).toEqual(["keep"]);
  });
});
