import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import type { AppSettings } from "../../shared/types";

type Props = {
  settings: AppSettings;
  onBack: () => void;
  onSave: (updates: Partial<AppSettings>) => void;
};

export function SettingsPanel({ settings, onBack, onSave }: Props) {
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
    <section className="panel settings-page" aria-label="设置">
      <div className="settings-page-header">
        <button className="icon-text-button" type="button" onClick={onBack}>
          <ArrowLeft size={15} />
          返回
        </button>
        <span className={`settings-status ${hasKey ? "ready" : "missing"}`}>{hasKey ? "AI 已配置" : "AI 未配置"}</span>
      </div>

      <div className="settings-intro">
        <h2>设置 Settings</h2>
        <p>这里管理和剪贴板主流程分开的偏好项。DeepSeek Key 只保存在本机，不会进入项目仓库。</p>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <strong>AI Split 拆词</strong>
          <span>不配置也可正常记录、收藏、搜索和快速粘贴。</span>
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

        <p className="settings-hint">AI 拆分只在点击单条剪贴板记录的“AI 拆分”时调用接口。</p>
      </div>
    </section>
  );
}
