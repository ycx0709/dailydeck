import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { createInitialData } from "../shared/defaults";
import type { PersistedData } from "../shared/types";
import { dailyDeckApi } from "./api";
import mascotUrl from "./assets/dailydeck-mascot.png";
import { ClipboardPanel } from "./components/ClipboardPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { StatusBar } from "./components/StatusBar";

type AppView = "clipboard" | "settings";

export function App() {
  const [data, setData] = useState<PersistedData>(createInitialData());
  const [view, setView] = useState<AppView>("clipboard");

  useEffect(() => {
    const loadData = () => void dailyDeckApi.getData().then(setData);
    loadData();
    const timer = window.setInterval(loadData, 1500);
    return () => window.clearInterval(timer);
  }, []);

  const refreshData = (next: Promise<PersistedData>) => void next.then(setData);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-title">
          <img className="app-mascot" src={mascotUrl} alt="DailyDeck clipboard assistant" />
          <div>
            <h1>DailyDeck 剪贴板</h1>
            <p>Clipboard history · 本地保存 · 快速搜索</p>
          </div>
        </div>

        {view === "clipboard" ? (
          <button className="icon-text-button" type="button" onClick={() => setView("settings")}>
            <Settings size={15} />
            设置
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
            items={data.clipboardItems}
            onCopy={(id) => refreshData(dailyDeckApi.copyClipboardItem(id))}
            onCopyText={(text) => refreshData(dailyDeckApi.copyText(text))}
            onAnalyze={(text) => dailyDeckApi.analyzeClipboardText(text)}
            onRename={(id, title) => refreshData(dailyDeckApi.renameClipboardItem(id, title))}
            onPin={(id, pinned) => refreshData(dailyDeckApi.pinClipboardItem(id, pinned))}
            onDelete={(id) => refreshData(dailyDeckApi.deleteClipboardItem(id))}
            onClear={(includePinned) => refreshData(dailyDeckApi.clearClipboardItems(includePinned))}
          />
        </section>
      )}

      <StatusBar
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
