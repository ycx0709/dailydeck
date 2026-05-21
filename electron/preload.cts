import { contextBridge, ipcRenderer } from "electron";
import type { PersistedData } from "../src/shared/types.js";

const api = {
  getData: (): Promise<PersistedData> => ipcRenderer.invoke("data:get"),
  copyClipboardItem: (id: string): Promise<PersistedData> => ipcRenderer.invoke("clipboard:copy", id),
  pinClipboardItem: (id: string, pinned: boolean): Promise<PersistedData> =>
    ipcRenderer.invoke("clipboard:pin", id, pinned),
  deleteClipboardItem: (id: string): Promise<PersistedData> => ipcRenderer.invoke("clipboard:delete", id),
  clearClipboardItems: (includePinned: boolean): Promise<PersistedData> =>
    ipcRenderer.invoke("clipboard:clear", includePinned),
  updateSettings: (updates: Partial<PersistedData["settings"]>): Promise<PersistedData> =>
    ipcRenderer.invoke("settings:update", updates)
};

contextBridge.exposeInMainWorld("dailyDeck", api);

export type DailyDeckApi = typeof api;
