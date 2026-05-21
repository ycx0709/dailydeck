import { Minus, Settings, Square, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createInitialData } from "../shared/defaults";
import type { AppSettings, PersistedData } from "../shared/types";
import { dailyDeckApi } from "./api";
import mascotUrl from "./assets/dailydeck-mascot.png";
import { ClipboardPanel } from "./components/ClipboardPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { StatusBar } from "./components/StatusBar";

type AppView = "clipboard" | "settings";
type Language = AppSettings["language"];

const appCopy: Record<Language, { title: string; settings: string }> = {
  zh: {
    title: "DailyDeck 剪贴板",
    settings: "设置"
  },
  en: {
    title: "DailyDeck Clipboard",
    settings: "Settings"
  }
};

export function App() {
  const [data, setData] = useState<PersistedData>(createInitialData());
  const [view, setView] = useState<AppView>("clipboard");
  const language = data.settings.language ?? "zh";
  const text = appCopy[language];

  useEffect(() => {
    const loadData = () => void dailyDeckApi.getData().then(setData);
    loadData();
    const timer = window.setInterval(loadData, 1500);
    return () => window.clearInterval(timer);
  }, []);

  const refreshData = (next: Promise<PersistedData>) => void next.then(setData);

  return (
    <main className="app-shell">
      <div className="window-titlebar">
        <div className="window-title">
          <img src={mascotUrl} alt="" />
          <span>DailyDeck</span>
        </div>
        <div className="window-controls">
          <button aria-label="Minimize" type="button" onClick={() => void dailyDeckApi.minimizeWindow()}>
            <Minus size={14} />
          </button>
          <button aria-label="Maximize" type="button" onClick={() => void dailyDeckApi.toggleMaximizeWindow()}>
            <Square size={12} />
          </button>
          <button aria-label="Close" className="close-button" type="button" onClick={() => void dailyDeckApi.closeWindow()}>
            <X size={15} />
          </button>
        </div>
      </div>

      <header className="app-header">
        <div className="app-title">
          <img className="app-mascot" src={mascotUrl} alt="DailyDeck clipboard assistant" />
          <div>
            <h1>{text.title}</h1>
          </div>
        </div>

        {view === "clipboard" ? (
          <button className="icon-text-button settings-entry-button" type="button" onClick={() => setView("settings")}>
            <Settings size={15} />
            {text.settings}
          </button>
        ) : null}
      </header>

      {view === "settings" ? (
        <SettingsPanel
          settings={data.settings}
          onBack={() => setView("clipboard")}
          onSave={(updates) => refreshData(dailyDeckApi.updateSettings(updates))}
        />
      ) : (
        <section className="clipboard-workspace">
          <ClipboardPanel
            language={language}
            items={data.clipboardItems}
            onCopy={(id) => refreshData(dailyDeckApi.copyClipboardItem(id))}
            onCopyText={(textToCopy) => refreshData(dailyDeckApi.copyText(textToCopy))}
            onAnalyze={(textToAnalyze) => dailyDeckApi.analyzeClipboardText(textToAnalyze)}
            onRename={(id, title) => refreshData(dailyDeckApi.renameClipboardItem(id, title))}
            onPin={(id, pinned) => refreshData(dailyDeckApi.pinClipboardItem(id, pinned))}
            onDelete={(id) => refreshData(dailyDeckApi.deleteClipboardItem(id))}
            onClear={(includePinned) => refreshData(dailyDeckApi.clearClipboardItems(includePinned))}
          />
        </section>
      )}

      <StatusBar
        language={language}
        notices={[]}
        clipboardEnabled={data.settings.clipboardRecordingEnabled}
        onToggleClipboard={() =>
          refreshData(
            dailyDeckApi.updateSettings({
              clipboardRecordingEnabled: !data.settings.clipboardRecordingEnabled
            })
          )
        }
      />
    </main>
  );
}
