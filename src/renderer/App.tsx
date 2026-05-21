import { useEffect, useState } from "react";
import { createInitialData } from "../shared/defaults";
import type { PersistedData, SystemSnapshot } from "../shared/types";
import { dailyDeckApi } from "./api";
import { ClipboardPanel } from "./components/ClipboardPanel";
import { MetricTile } from "./components/MetricTile";
import { NotesPanel } from "./components/NotesPanel";
import { ProcessPanel } from "./components/ProcessPanel";
import { StatusBar } from "./components/StatusBar";
import { TaskPanel } from "./components/TaskPanel";

export function App() {
  const [data, setData] = useState<PersistedData>(createInitialData());
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);

  useEffect(() => {
    void dailyDeckApi.getData().then(setData);
    const loadSnapshot = () => void dailyDeckApi.getSystemSnapshot().then(setSnapshot);
    loadSnapshot();
    const timer = window.setInterval(loadSnapshot, 2000);
    return () => window.clearInterval(timer);
  }, []);

  const refreshData = (next: Promise<PersistedData>) => void next.then(setData);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>DailyDeck</h1>
          <p>Desktop performance and daily capture.</p>
        </div>
      </header>

      <section className="metric-grid">
        {snapshot ? (
          <>
            <MetricTile metric={snapshot.metrics.cpu} />
            <MetricTile metric={snapshot.metrics.memory} />
            <MetricTile metric={snapshot.metrics.disk} />
            <MetricTile metric={snapshot.metrics.network} />
          </>
        ) : null}
      </section>

      <section className="workspace-grid">
        <div className="left-stack">
          <TaskPanel
            tasks={data.tasks}
            onCreate={(text) => refreshData(dailyDeckApi.createTask(text))}
            onToggle={(id, completed) => refreshData(dailyDeckApi.updateTask(id, { completed }))}
            onDelete={(id) => refreshData(dailyDeckApi.deleteTask(id))}
          />
          <NotesPanel
            notes={data.notes}
            onCreate={(text) => refreshData(dailyDeckApi.createNote(text))}
            onDelete={(id) => refreshData(dailyDeckApi.deleteNote(id))}
          />
          <ProcessPanel processes={snapshot?.processes ?? []} />
        </div>
        <ClipboardPanel
          items={data.clipboardItems}
          onCopy={(id) => refreshData(dailyDeckApi.copyClipboardItem(id))}
          onPin={(id, pinned) => refreshData(dailyDeckApi.pinClipboardItem(id, pinned))}
          onDelete={(id) => refreshData(dailyDeckApi.deleteClipboardItem(id))}
          onClear={(includePinned) => refreshData(dailyDeckApi.clearClipboardItems(includePinned))}
        />
      </section>

      <StatusBar
        notices={snapshot?.notices ?? []}
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
