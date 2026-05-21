import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClipboardPanel } from "../src/renderer/components/ClipboardPanel";
import type { ClipboardItem } from "../src/shared/types";

const item: ClipboardItem = {
  id: "clip-1",
  text: "https://api-docs.deepseek.com/zh-cn/",
  pinned: true,
  createdAt: "2026-05-21T00:00:00.000Z",
  lastCopiedAt: "2026-05-21T00:00:00.000Z"
};

describe("clipboard panel names", () => {
  it("renames a favorite item and uses the name in search", () => {
    const onRename = vi.fn();
    render(
      <ClipboardPanel
        language="zh"
        items={[{ ...item, title: "DeepSeek API docs" }]}
        onCopy={vi.fn()}
        onCopyText={vi.fn()}
        onAnalyze={vi.fn()}
        onRename={onRename}
        onPin={vi.fn()}
        onDelete={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByText("DeepSeek API docs")).toBeTruthy();

    fireEvent.click(screen.getByText("改名"));
    const input = screen.getByLabelText("收藏名称");
    fireEvent.change(input, { target: { value: "DeepSeek 文档" } });
    fireEvent.click(screen.getByText("保存"));

    expect(onRename).toHaveBeenCalledWith("clip-1", "DeepSeek 文档");
  });
});
