import { useEffect, useState } from "react";
import type { AppSettings } from "../../shared/types";

type Props = {
  settings: AppSettings;
  onSave: (updates: Partial<AppSettings>) => void;
};

export function SettingsPanel({ settings, onSave }: Props) {
  const [apiKey, setApiKey] = useState(settings.deepSeekApiKey ?? "");
  const [model, setModel] = useState(settings.deepSeekModel);
  const hasKey = Boolean(settings.deepSeekApiKey?.trim());

  useEffect(() => {
    setApiKey(settings.deepSeekApiKey ?? "");
  }, [settings.deepSeekApiKey]);

  useEffect(() => {
    setModel(settings.deepSeekModel);
  }, [settings.deepSeekModel]);

  return (
    <section className="settings-panel" aria-label="AI 拆分配置">
      <div className="settings-header">
        <div>
          <strong>AI Split 拆词配置</strong>
          <span>DeepSeek Key 只保存在本机；不配置也可正常使用剪贴板。</span>
        </div>
        <span className={`settings-status ${hasKey ? "ready" : "missing"}`}>{hasKey ? "已配置" : "未配置"}</span>
      </div>

      <div className="settings-grid">
        <label className="settings-field">
          <span>API Key</span>
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
          <span>模型 ID</span>
          <input
            aria-label="DeepSeek 模型"
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
            保存配置
          </button>
          <button
            type="button"
            onClick={() => {
              setApiKey("");
              onSave({ deepSeekApiKey: undefined });
            }}
          >
            清空 Key
          </button>
        </div>
      </div>

      <p className="settings-hint">AI 拆分只在点击单条剪贴板记录的“AI 拆分”时调用接口，日常记录和搜索不依赖 API Key。</p>
    </section>
  );
}
