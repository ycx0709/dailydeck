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
          <h1>DailyDeck</h1>
          <p>Clipboard history, kept local.</p>
        </div>
      </header>

      <section className="clipboard-workspace">
        <ClipboardPanel
          items={data.clipboardItems}
          onCopy={(id) => refreshData(dailyDeckApi.copyClipboardItem(id))}
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
