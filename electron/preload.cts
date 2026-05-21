import { contextBridge, ipcRenderer } from "electron";
import type { PersistedData } from "../src/shared/types.js";

const api = {
  getData: (): Promise<PersistedData> => ipcRenderer.invoke("data:get"),
  copyClipboardItem: (id: string): Promise<PersistedData> => ipcRenderer.invoke("clipboard:copy", id),
  copyText: (text: string): Promise<PersistedData> => ipcRenderer.invoke("clipboard:writeText", text),
  pinClipboardItem: (id: string, pinned: boolean): Promise<PersistedData> =>
    ipcRenderer.invoke("clipboard:pin", id, pinned),
  deleteClipboardItem: (id: string): Promise<PersistedData> => ipcRenderer.invoke("clipboard:delete", id),
  clearClipboardItems: (includePinned: boolean): Promise<PersistedData> =>
    ipcRenderer.invoke("clipboard:clear", includePinned),
  updateSettings: (updates: Partial<PersistedData["settings"]>): Promise<PersistedData> =>
    ipcRenderer.invoke("settings:update", updates),
  showQuickPaste: (): Promise<void> => ipcRenderer.invoke("quickPaste:show"),
  hideQuickPaste: (): Promise<void> => ipcRenderer.invoke("quickPaste:hide"),
  onQuickPasteShown: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on("quickPaste:shown", listener);
    return () => ipcRenderer.removeListener("quickPaste:shown", listener);
  }
};

contextBridge.exposeInMainWorld("dailyDeck", api);

export type DailyDeckApi = typeof api;
