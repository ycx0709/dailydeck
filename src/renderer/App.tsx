import { useEffect, useState } from "react";
import { createInitialData } from "../shared/defaults";
import type { PersistedData } from "../shared/types";
import { dailyDeckApi } from "./api";
import { ClipboardPanel } from "./components/ClipboardPanel";
import { StatusBar } from "./components/StatusBar";

export function App() {
  const [data, setData] = useState<PersistedData>(createInitialData());

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
        <div>
          <h1>DailyDeck 剪贴板</h1>
          <p>Clipboard history, 本地保存最近复制的文本</p>
        </div>
      </header>

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
