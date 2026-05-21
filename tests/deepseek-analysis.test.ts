import { describe, expect, it, vi } from "vitest";
import { analyzeClipboardTextWithDeepSeek } from "../electron/services/deepseek";

describe("deepseek clipboard analysis", () => {
  it("calls DeepSeek with the configured model and parses semantic split JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "会议安排",
                keywords: ["会议", "明天"],
                segments: ["明天 10 点开会", "地点在会议室 A"],
                todos: ["准备会议材料"],
                entities: [{ label: "时间", value: "明天 10 点" }]
              })
            }
          }
        ]
      })
    });

    const result = await analyzeClipboardTextWithDeepSeek(
      "明天 10 点开会，地点在会议室 A，记得准备会议材料。",
      {
        apiKey: "local-key",
        model: "deepseek-v4-flash"
      },
      fetchMock
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer local-key",
          "Content-Type": "application/json"
        })
      })
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe("deepseek-v4-flash");
    expect(result.segments).toEqual(["明天 10 点开会", "地点在会议室 A"]);
    expect(result.entities).toEqual([{ label: "时间", value: "明天 10 点" }]);
  });
});
