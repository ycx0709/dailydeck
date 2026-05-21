import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClipboardPanel } from "../src/renderer/components/ClipboardPanel";
import type { ClipboardItem } from "../src/shared/types";

const longToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9".repeat(8);

const item: ClipboardItem = {
  id: "long-key",
  text: longToken,
  title: "MinerU 配置",
  pinned: true,
  createdAt: "2026-05-21T00:00:00.000Z",
  lastCopiedAt: "2026-05-21T00:00:00.000Z"
};

describe("clipboard panel long text", () => {
  it("collapses very long clipboard text and lets the user expand it", () => {
    render(
      <ClipboardPanel
        language="zh"
        items={[item]}
        onCopy={vi.fn()}
        onCopyText={vi.fn()}
        onAnalyze={vi.fn()}
        onRename={vi.fn()}
        onPin={vi.fn()}
        onDelete={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByText(longToken).classList.contains("collapsed")).toBe(true);

    fireEvent.click(screen.getByText("展开"));

    expect(screen.getByText(longToken).classList.contains("expanded")).toBe(true);
    expect(screen.getByText("收起")).toBeTruthy();
  });
});
