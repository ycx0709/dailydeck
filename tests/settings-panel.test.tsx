import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsPanel } from "../src/renderer/components/SettingsPanel";
import { createInitialData } from "../src/shared/defaults";

describe("settings panel", () => {
  it("saves a local DeepSeek API key and model for AI split", () => {
    const onBack = vi.fn();
    const onSave = vi.fn();

    render(<SettingsPanel settings={createInitialData().settings} onBack={onBack} onSave={onSave} />);

    expect(screen.getByText("AI 未配置")).toBeTruthy();
    expect(screen.getByText(/不配置也可正常记录/)).toBeTruthy();

    fireEvent.change(screen.getByLabelText("DeepSeek API Key"), { target: { value: "sk-local-only" } });
    fireEvent.change(screen.getByLabelText("DeepSeek 模型"), { target: { value: "deepseek-v4-flash" } });
    fireEvent.click(screen.getByText("保存配置"));

    expect(onSave).toHaveBeenCalledWith({
      deepSeekApiKey: "sk-local-only",
      deepSeekModel: "deepseek-v4-flash"
    });
  });

  it("clears the saved API key and returns to the clipboard page", () => {
    const onBack = vi.fn();
    const onSave = vi.fn();
    const settings = { ...createInitialData().settings, deepSeekApiKey: "sk-existing" };

    render(<SettingsPanel settings={settings} onBack={onBack} onSave={onSave} />);

    expect(screen.getByText("AI 已配置")).toBeTruthy();
    fireEvent.click(screen.getByText("清空 Key"));
    fireEvent.click(screen.getByText("返回"));

    expect(onSave).toHaveBeenCalledWith({ deepSeekApiKey: undefined });
    expect(onBack).toHaveBeenCalled();
  });
});
