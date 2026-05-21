import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createInitialData } from "../src/shared/defaults";
import type { DailyDeckApi } from "../electron/preload.cjs";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("quick paste panel", () => {
  it("searches clipboard items and copies the selected item with Enter", async () => {
    const data = {
      ...createInitialData(),
      clipboardItems: [
        {
          id: "clip-1",
          text: "normal note",
          pinned: false,
          createdAt: "2026-05-21T00:00:00.000Z",
          lastCopiedAt: "2026-05-21T00:00:00.000Z"
        },
        {
          id: "clip-2",
          text: "React 代码片段",
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
      deleteClipboardItem: vi.fn().mockResolvedValue(data),
      clearClipboardItems: vi.fn().mockResolvedValue(data),
      updateSettings: vi.fn().mockResolvedValue(data),
      showQuickPaste: vi.fn().mockResolvedValue(undefined),
      hideQuickPaste: vi.fn().mockResolvedValue(undefined),
      onQuickPasteShown: vi.fn().mockReturnValue(() => undefined)
    } satisfies DailyDeckApi;

    window.dailyDeck = api;
    const { QuickPasteApp } = await import("../src/renderer/QuickPasteApp");

    render(<QuickPasteApp />);

    const search = await screen.findByPlaceholderText("搜索剪贴板内容");
    fireEvent.change(search, { target: { value: "代码" } });
    expect(await screen.findByText("React 代码片段")).toBeTruthy();
    expect(screen.queryByText("normal note")).toBeNull();

    fireEvent.keyDown(search, { key: "Enter" });

    await waitFor(() => expect(api.copyClipboardItem).toHaveBeenCalledWith("clip-2"));
    expect(api.hideQuickPaste).toHaveBeenCalled();
  });
});
