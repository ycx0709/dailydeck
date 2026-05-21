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
    expect(screen.queryByText(/不配置/)).toBeNull();

    fireEvent.change(screen.getByLabelText("DeepSeek API Key"), { target: { value: "sk-local-only" } });
    fireEvent.change(screen.getByLabelText("DeepSeek Model"), { target: { value: "deepseek-v4-flash" } });
    fireEvent.click(screen.getByText("保存"));

    expect(onSave).toHaveBeenCalledWith({
      deepSeekApiKey: "sk-local-only",
      deepSeekModel: "deepseek-v4-flash"
    });
  });

  it("persists language changes through settings updates", () => {
    const onBack = vi.fn();
    const onSave = vi.fn();

    render(<SettingsPanel settings={createInitialData().settings} onBack={onBack} onSave={onSave} />);

    fireEvent.click(screen.getByText("English"));

    expect(onSave).toHaveBeenCalledWith({ language: "en" });
  });

  it("renders English labels when language is English", () => {
    const onBack = vi.fn();
    const onSave = vi.fn();
    const settings = { ...createInitialData().settings, language: "en" as const };

    render(<SettingsPanel settings={settings} onBack={onBack} onSave={onSave} />);

    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByText("AI Split")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
    expect(screen.getByText("中文")).toBeTruthy();
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
