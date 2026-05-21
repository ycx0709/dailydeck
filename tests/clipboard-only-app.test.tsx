import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DailyDeckApi } from "../electron/preload.cjs";
import { createInitialData } from "../src/shared/defaults";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("clipboard-only app shell", () => {
  it("keeps AI key configuration on a separate settings page", async () => {
    const data = {
      ...createInitialData(),
      clipboardItems: [
        {
          id: "clip-1",
          text: "remember this",
          pinned: false,
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
      onQuickPasteShown: vi.fn()
    } satisfies DailyDeckApi;

    window.dailyDeck = api;
    const { App } = await import("../src/renderer/App");

    render(<App />);

    expect(await screen.findByText("剪贴板 Clipboard")).toBeTruthy();
    expect(await screen.findByText("remember this")).toBeTruthy();
    expect(screen.queryByLabelText("DeepSeek API Key")).toBeNull();
    await waitFor(() => expect(api.getData).toHaveBeenCalled());

    fireEvent.click(screen.getByText("设置"));

    expect(await screen.findByText("设置 Settings")).toBeTruthy();
    expect(screen.getByLabelText("DeepSeek API Key")).toBeTruthy();
    expect(screen.queryByText("remember this")).toBeNull();

    fireEvent.click(screen.getByText("返回"));

    expect(await screen.findByText("remember this")).toBeTruthy();
    expect(screen.queryByLabelText("DeepSeek API Key")).toBeNull();
    expect(screen.queryByText("Today")).toBeNull();
    expect(screen.queryByText("Quick notes")).toBeNull();
    expect(screen.queryByText("High usage")).toBeNull();
  });
});
