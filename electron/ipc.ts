import { ipcMain } from "electron";
import { clearClipboardItems, setClipboardPinned, type ClipboardRecorder } from "./services/clipboard.js";
import type { JsonStore } from "./services/storage.js";
import { getSystemSnapshot } from "./services/system.js";

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

export function registerIpc(store: JsonStore, clipboardRecorder: ClipboardRecorder): void {
  ipcMain.handle("system:getSnapshot", () => getSystemSnapshot());

  ipcMain.handle("data:get", () => store.read());

  ipcMain.handle("task:create", async (_event, text: string) =>
    store.update((data) => {
      const trimmed = text.trim();
      if (!trimmed) return data;

      const timestamp = now();
      return {
        ...data,
        tasks: [
          {
            id: id(),
            text: trimmed,
            completed: false,
            createdAt: timestamp,
            updatedAt: timestamp
          },
          ...data.tasks
        ]
      };
    })
  );

  ipcMain.handle("task:update", async (_event, taskId: string, updates: { text?: string; completed?: boolean }) =>
    store.update((data) => ({
      ...data,
      tasks: data.tasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, text: updates.text?.trim() ?? task.text, updatedAt: now() }
          : task
      )
    }))
  );

  ipcMain.handle("task:delete", async (_event, taskId: string) =>
    store.update((data) => ({
      ...data,
      tasks: data.tasks.filter((task) => task.id !== taskId)
    }))
  );

  ipcMain.handle("note:create", async (_event, text: string) =>
    store.update((data) => {
      const trimmed = text.trim();
      if (!trimmed) return data;

      const timestamp = now();
      return {
        ...data,
        notes: [
          {
            id: id(),
            text: trimmed,
            createdAt: timestamp,
            updatedAt: timestamp
          },
          ...data.notes
        ]
      };
    })
  );

  ipcMain.handle("note:delete", async (_event, noteId: string) =>
    store.update((data) => ({
      ...data,
      notes: data.notes.filter((note) => note.id !== noteId)
    }))
  );

  ipcMain.handle("clipboard:copy", async (_event, itemId: string) => {
    const data = await store.read();
    const item = data.clipboardItems.find((entry) => entry.id === itemId);
    if (item) clipboardRecorder.writeText(item.text);
    return data;
  });

  ipcMain.handle("clipboard:pin", async (_event, itemId: string, pinned: boolean) =>
    store.update((data) => setClipboardPinned(data, itemId, pinned))
  );

  ipcMain.handle("clipboard:delete", async (_event, itemId: string) =>
    store.update((data) => ({
      ...data,
      clipboardItems: data.clipboardItems.filter((item) => item.id !== itemId)
    }))
  );

  ipcMain.handle("clipboard:clear", async (_event, includePinned: boolean) =>
    store.update((data) => clearClipboardItems(data, includePinned))
  );

  ipcMain.handle("settings:update", async (_event, updates: Partial<{ clipboardRecordingEnabled: boolean }>) =>
    store.update((data) => ({
      ...data,
      settings: { ...data.settings, ...updates }
    }))
  );
}
