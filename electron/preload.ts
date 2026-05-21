import { contextBridge, ipcRenderer } from "electron";
import type { PersistedData, SystemSnapshot } from "../src/shared/types.js";

const api = {
  getSystemSnapshot: (): Promise<SystemSnapshot> => ipcRenderer.invoke("system:getSnapshot"),
  getData: (): Promise<PersistedData> => ipcRenderer.invoke("data:get"),
  createTask: (text: string): Promise<PersistedData> => ipcRenderer.invoke("task:create", text),
  updateTask: (id: string, updates: { text?: string; completed?: boolean }): Promise<PersistedData> =>
    ipcRenderer.invoke("task:update", id, updates),
  deleteTask: (id: string): Promise<PersistedData> => ipcRenderer.invoke("task:delete", id),
  createNote: (text: string): Promise<PersistedData> => ipcRenderer.invoke("note:create", text),
  deleteNote: (id: string): Promise<PersistedData> => ipcRenderer.invoke("note:delete", id),
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
