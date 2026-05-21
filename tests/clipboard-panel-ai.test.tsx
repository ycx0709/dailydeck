import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClipboardPanel } from "../src/renderer/components/ClipboardPanel";
import type { AiClipboardAnalysis, ClipboardItem } from "../src/shared/types";

const clipboardItem: ClipboardItem = {
  id: "clip-ai",
  text: "明天 10 点开会，地点在会议室 A，记得准备会议材料。",
  pinned: false,
  createdAt: "2026-05-21T00:00:00.000Z",
  lastCopiedAt: "2026-05-21T00:00:00.000Z"
};

describe("clipboard panel AI split", () => {
  it("replaces manual text tools with DeepSeek semantic split results", async () => {
    const result: AiClipboardAnalysis = {
      summary: "会议安排",
      keywords: ["会议", "明天"],
      segments: ["明天 10 点开会", "地点在会议室 A"],
      todos: ["准备会议材料"],
      entities: [{ label: "时间", value: "明天 10 点" }]
    };
    const onAnalyze = vi.fn().mockResolvedValue(result);
    const onCopyText = vi.fn();

    render(
      <ClipboardPanel
        items={[clipboardItem]}
        onCopy={vi.fn()}
        onCopyText={onCopyText}
        onAnalyze={onAnalyze}
        onRename={vi.fn()}
        onPin={vi.fn()}
        onDelete={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.queryByText("去换行")).toBeNull();
    expect(screen.queryByText("JSON 格式化")).toBeNull();

    fireEvent.click(screen.getByText("AI 拆分"));

    await waitFor(() => expect(onAnalyze).toHaveBeenCalledWith(clipboardItem.text));
    expect(await screen.findByText("会议安排")).toBeTruthy();
    expect(screen.getByText("明天 10 点开会")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("复制拆分片段: 明天 10 点开会"));
    expect(onCopyText).toHaveBeenCalledWith("明天 10 点开会");
  });
});
