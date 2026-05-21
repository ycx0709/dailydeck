import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DailyDeckApi } from "../electron/preload.cjs";
import { createInitialData } from "../src/shared/defaults";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("quick paste visual layout", () => {
  it("uses a fixed multi-row item layout for named long clipboard entries", async () => {
    const data = {
      ...createInitialData(),
      clipboardItems: [
        {
          id: "clip-long",
          text: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9".repeat(8),
          title: "DailyDeck 剪贴板 API key",
          pinned: true,
          createdAt: "2026-05-21T00:00:00.000Z",
          lastCopiedAt: "2026-05-21T00:00:00.000Z"
        }
      ]
    };
    const api = {
      getData: vi.fn().mockResolvedValue(data),
      copyClipboardItem: vi.fn().mockResolvedValue(data),
      copyText: vi.fn().mockResolvedValue(data),
      pinClipboardItem: vi.fn().mockResolvedValue(data),
      renameClipboardItem: vi.fn().mockResolvedValue(data),
      deleteClipboardItem: vi.fn().mockResolvedValue(data),
      clearClipboardItems: vi.fn().mockResolvedValue(data),
      updateSettings: vi.fn().mockResolvedValue(data),
      analyzeClipboardText: vi.fn(),
      showQuickPaste: vi.fn().mockResolvedValue(undefined),
      hideQuickPaste: vi.fn().mockResolvedValue(undefined),
      onQuickPasteShown: vi.fn().mockReturnValue(() => undefined)
    } satisfies DailyDeckApi;

    window.dailyDeck = api;
    const { QuickPasteApp } = await import("../src/renderer/QuickPasteApp");

    render(<QuickPasteApp />);

    const title = await screen.findByText("DailyDeck 剪贴板 API key");
    const item = title.closest(".quick-paste-item");

    expect(item?.classList.contains("quick-paste-item")).toBe(true);
    expect(item).toBeTruthy();
    expect(item?.querySelector("span")?.textContent).toBe("DailyDeck 剪贴板 API key");
    expect(item?.querySelector("em")?.textContent).toContain("eyJ0eXAi");
    expect(item?.querySelector("small")?.textContent).toBe("收藏");
  });
});
