import { ArrowLeft, Languages } from "lucide-react";
import { useEffect, useState } from "react";
import type { AppSettings } from "../../shared/types";

type Props = {
  settings: AppSettings;
  onBack: () => void;
  onSave: (updates: Partial<AppSettings>) => void;
};

type Language = AppSettings["language"];

const copy: Record<
  Language,
  {
    back: string;
    title: string;
    toggle: string;
    configured: string;
    missing: string;
    aiTitle: string;
    apiKey: string;
    model: string;
    save: string;
    clear: string;
  }
> = {
  zh: {
    back: "返回",
    title: "设置",
    toggle: "English",
    configured: "AI 已配置",
    missing: "AI 未配置",
    aiTitle: "AI 拆词",
    apiKey: "API Key",
    model: "模型 ID",
    save: "保存",
    clear: "清空 Key"
  },
  en: {
    back: "Back",
    title: "Settings",
    toggle: "中文",
    configured: "AI Ready",
    missing: "AI Missing",
    aiTitle: "AI Split",
    apiKey: "API Key",
    model: "Model ID",
    save: "Save",
    clear: "Clear Key"
  }
};

export function SettingsPanel({ settings, onBack, onSave }: Props) {
  const [apiKey, setApiKey] = useState(settings.deepSeekApiKey ?? "");
  const [model, setModel] = useState(settings.deepSeekModel);
  const language = settings.language ?? "zh";
  const hasKey = Boolean(settings.deepSeekApiKey?.trim());
  const text = copy[language];

  useEffect(() => {
    setApiKey(settings.deepSeekApiKey ?? "");
  }, [settings.deepSeekApiKey]);

  useEffect(() => {
    setModel(settings.deepSeekModel);
  }, [settings.deepSeekModel]);

  const switchLanguage = () => {
    onSave({ language: language === "zh" ? "en" : "zh" });
  };

  return (
    <section className="panel settings-page" aria-label={text.title}>
      <div className="settings-page-header">
        <button className="icon-text-button" type="button" onClick={onBack}>
          <ArrowLeft size={15} />
          {text.back}
        </button>
        <div className="settings-page-actions">
          <button className="icon-text-button" type="button" onClick={switchLanguage}>
            <Languages size={15} />
            {text.toggle}
          </button>
          <span className={`settings-status ${hasKey ? "ready" : "missing"}`}>
            {hasKey ? text.configured : text.missing}
          </span>
        </div>
      </div>

      <div className="settings-intro">
        <h2>{text.title}</h2>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <strong>{text.aiTitle}</strong>
        </div>

        <div className="settings-grid">
          <label className="settings-field">
            <span>{text.apiKey}</span>
            <input
              aria-label="DeepSeek API Key"
              autoComplete="off"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="sk-..."
            />
          </label>

          <label className="settings-field model-field">
            <span>{text.model}</span>
            <input
              aria-label="DeepSeek Model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="deepseek-v4-flash"
            />
          </label>

          <div className="settings-actions">
            <button
              type="button"
              onClick={() =>
                onSave({
                  deepSeekApiKey: apiKey.trim() || undefined,
                  deepSeekModel: model.trim() || "deepseek-v4-flash"
                })
              }
            >
              {text.save}
            </button>
            <button
              type="button"
              onClick={() => {
                setApiKey("");
                onSave({ deepSeekApiKey: undefined });
              }}
            >
              {text.clear}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
