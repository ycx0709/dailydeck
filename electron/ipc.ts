import { BrowserWindow, ipcMain } from "electron";
import { analyzeClipboardTextWithDeepSeek } from "./services/deepseek.js";
import {
  clearClipboardItems,
  renameClipboardItem,
  setClipboardPinned,
  type ClipboardRecorder
} from "./services/clipboard.js";
import type { JsonStore } from "./services/storage.js";
import type { AppSettings } from "../src/shared/types.js";

export type QuickPasteActions = {
  show: () => void;
  hide: () => void;
};

export function registerIpc(
  store: JsonStore,
  clipboardRecorder: ClipboardRecorder,
  quickPasteActions?: QuickPasteActions
): void {
  ipcMain.handle("data:get", () => store.read());

  ipcMain.handle("clipboard:copy", async (_event, itemId: string) => {
    const data = await store.read();
    const item = data.clipboardItems.find((entry) => entry.id === itemId);
    if (item) clipboardRecorder.writeText(item.text);
    return data;
  });

  ipcMain.handle("clipboard:writeText", async (_event, text: string) => {
    clipboardRecorder.writeText(text);
    return store.read();
  });

  ipcMain.handle("clipboard:pin", async (_event, itemId: string, pinned: boolean) =>
    store.update((data) => setClipboardPinned(data, itemId, pinned))
  );

  ipcMain.handle("clipboard:rename", async (_event, itemId: string, title: string) =>
    store.update((data) => renameClipboardItem(data, itemId, title))
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

  ipcMain.handle("settings:update", async (_event, updates: Partial<AppSettings>) =>
    store.update((data) => ({
      ...data,
      settings: { ...data.settings, ...updates }
    }))
  );

  ipcMain.handle("ai:analyzeClipboardText", async (_event, text: string) => {
    const data = await store.read();
    return analyzeClipboardTextWithDeepSeek(text, {
      apiKey: data.settings.deepSeekApiKey ?? "",
      model: data.settings.deepSeekModel
    });
  });

  ipcMain.handle("quickPaste:show", () => quickPasteActions?.show());
  ipcMain.handle("quickPaste:hide", () => quickPasteActions?.hide());
  ipcMain.handle("window:minimize", (event) => BrowserWindow.fromWebContents(event.sender)?.minimize());
  ipcMain.handle("window:toggleMaximize", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;
    if (window.isMaximized()) window.unmaximize();
    else window.maximize();
  });
  ipcMain.handle("window:close", (event) => BrowserWindow.fromWebContents(event.sender)?.close());
}
