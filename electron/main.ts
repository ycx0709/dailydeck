import { app, BrowserWindow, Menu, Tray, clipboard, nativeImage } from "electron";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { registerIpc } from "./ipc.js";
import { ClipboardRecorder } from "./services/clipboard.js";
import { JsonStore } from "./services/storage.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let recorder: ClipboardRecorder | null = null;
let isQuitting = false;

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 980,
    height: 680,
    minWidth: 760,
    minHeight: 560,
    title: "DailyDeck",
    backgroundColor: "#faf9f5",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void window.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void window.loadFile(join(__dirname, "../dist-renderer/index.html"));
  }

  window.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      window.hide();
    }
  });

  return window;
}

function createTray(): void {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip("DailyDeck");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Show DailyDeck", click: () => mainWindow?.show() },
      { label: "Hide DailyDeck", click: () => mainWindow?.hide() },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ])
  );
}

app.whenReady().then(() => {
  const store = new JsonStore(join(app.getPath("userData"), "dailydeck.json"));
  recorder = new ClipboardRecorder(clipboard, store);
  recorder.start();
  registerIpc(store, recorder);

  mainWindow = createWindow();
  createTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

app.on("before-quit", () => {
  isQuitting = true;
  recorder?.stop();
});
