import { app, BrowserWindow, Menu, Tray, clipboard, globalShortcut, nativeImage, screen } from "electron";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { registerIpc } from "./ipc.js";
import { ClipboardRecorder } from "./services/clipboard.js";
import { JsonStore } from "./services/storage.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
let mainWindow: BrowserWindow | null = null;
let quickPasteWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let recorder: ClipboardRecorder | null = null;
let isQuitting = false;

function createTrayIcon() {
  return nativeImage.createFromPath(join(__dirname, "../../assets/tray.ico"));
}

function loadRenderer(window: BrowserWindow, hash = ""): void {
  if (process.env.VITE_DEV_SERVER_URL) {
    void window.loadURL(`${process.env.VITE_DEV_SERVER_URL}${hash}`);
  } else {
    void window.loadFile(join(__dirname, "../../dist-renderer/index.html"), {
      hash: hash.replace("#", "")
    });
  }
}

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 980,
    height: 680,
    minWidth: 760,
    minHeight: 560,
    title: "DailyDeck",
    icon: join(__dirname, "../../assets/tray.ico"),
    backgroundColor: "#faf9f5",
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  loadRenderer(window);

  window.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      window.hide();
    }
  });

  return window;
}

function createQuickPasteWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 560,
    height: 420,
    show: false,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    title: "Quick Paste",
    icon: join(__dirname, "../../assets/tray.ico"),
    backgroundColor: "#faf9f5",
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  loadRenderer(window, "#quick-paste");
  window.on("blur", () => window.hide());
  window.on("closed", () => {
    quickPasteWindow = null;
  });
  return window;
}

function showQuickPasteWindow(): void {
  if (!quickPasteWindow) {
    quickPasteWindow = createQuickPasteWindow();
  }

  const { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const width = 560;
  const height = 420;
  quickPasteWindow.setBounds({
    width,
    height,
    x: Math.round(workArea.x + (workArea.width - width) / 2),
    y: Math.round(workArea.y + workArea.height * 0.18)
  });
  quickPasteWindow.show();
  quickPasteWindow.focus();
  quickPasteWindow.webContents.send("quickPaste:shown");
}

function hideQuickPasteWindow(): void {
  quickPasteWindow?.hide();
}

function createTray(): void {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip("DailyDeck");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "打开 DailyDeck", click: () => mainWindow?.show() },
      { label: "快速粘贴", click: showQuickPasteWindow },
      { label: "隐藏 DailyDeck", click: () => mainWindow?.hide() },
      { type: "separator" },
      {
        label: "退出",
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
  registerIpc(store, recorder, {
    show: showQuickPasteWindow,
    hide: hideQuickPasteWindow
  });

  mainWindow = createWindow();
  quickPasteWindow = createQuickPasteWindow();
  createTray();
  globalShortcut.register("CommandOrControl+Shift+V", showQuickPasteWindow);

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

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
