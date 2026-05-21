# DailyDeck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working Windows version of DailyDeck: a compact Electron + React desktop app with live system metrics, tasks, quick notes, clipboard history, and tray controls.

**Architecture:** Electron owns desktop capabilities in the main process: windows, tray, clipboard polling, system metrics, and local persistence. React renders the dashboard through a typed preload API, with no direct Node access in the renderer. Shared TypeScript types keep IPC payloads, persistence, and UI state aligned.

**Tech Stack:** Electron, Vite, React, TypeScript, Vitest, Testing Library, `systeminformation`, local JSON persistence, CSS modules or plain CSS.

---

## File Structure

- Create: `package.json` - scripts and dependencies for Electron, Vite, React, TypeScript, tests, and build.
- Create: `tsconfig.json` - base TypeScript settings.
- Create: `tsconfig.node.json` - Electron main and preload TypeScript settings.
- Create: `tsconfig.web.json` - renderer TypeScript settings.
- Create: `vite.config.ts` - Vite renderer config.
- Create: `index.html` - renderer HTML shell.
- Create: `electron/main.ts` - Electron app lifecycle, window, tray, IPC registration.
- Create: `electron/preload.ts` - safe typed bridge exposed to the renderer.
- Create: `electron/ipc.ts` - IPC handler registration.
- Create: `electron/services/storage.ts` - local JSON persistence with typed data access.
- Create: `electron/services/clipboard.ts` - clipboard polling and history operations.
- Create: `electron/services/system.ts` - system metrics and process snapshot.
- Create: `electron/types.ts` - main-process internal types if needed.
- Create: `src/shared/types.ts` - app-wide public data contracts.
- Create: `src/shared/defaults.ts` - default settings and initial persisted state.
- Create: `src/renderer/main.tsx` - React entry point.
- Create: `src/renderer/App.tsx` - dashboard composition and state orchestration.
- Create: `src/renderer/api.ts` - typed wrapper around `window.dailyDeck`.
- Create: `src/renderer/styles.css` - Claude-inspired warm utility UI.
- Create: `src/renderer/components/MetricTile.tsx` - compact metric display.
- Create: `src/renderer/components/TaskPanel.tsx` - today tasks UI.
- Create: `src/renderer/components/NotesPanel.tsx` - quick notes UI.
- Create: `src/renderer/components/ClipboardPanel.tsx` - clipboard history UI.
- Create: `src/renderer/components/ProcessPanel.tsx` - high-usage process list.
- Create: `src/renderer/components/StatusBar.tsx` - health and clipboard status.
- Create: `src/renderer/vite-env.d.ts` - renderer global type declarations.
- Create: `tests/storage.test.ts` - persistence behavior tests.
- Create: `tests/clipboard-history.test.ts` - duplicate, pin, clear behavior tests.
- Create: `tests/tasks-notes.test.ts` - task and note mutation tests.
- Create: `.gitignore` - ignore dependencies, build output, cache, and local app data.

## Implementation Tasks

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tsconfig.web.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.gitignore`

- [ ] **Step 1: Create package and TypeScript configuration**

Create `package.json`:

```json
{
  "name": "dailydeck",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "electron:build": "tsc -p tsconfig.node.json",
    "web:build": "vite build",
    "build": "npm run electron:build && npm run web:build",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.node.json && tsc -p tsconfig.web.json --noEmit",
    "start": "npm run build && electron ."
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "electron": "^35.0.0",
    "lucide-react": "^0.468.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "systeminformation": "^5.23.0",
    "vite": "^6.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

Create `tsconfig.node.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist-electron",
    "types": ["node", "electron"]
  },
  "include": ["electron/**/*.ts", "src/shared/**/*.ts"]
}
```

Create `tsconfig.web.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "tests/**/*.ts", "tests/**/*.tsx", "vite.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist-renderer",
    emptyOutDir: true
  },
  test: {
    environment: "jsdom",
    globals: true
  }
});
```

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DailyDeck</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/renderer/main.tsx"></script>
  </body>
</html>
```

Create `.gitignore`:

```gitignore
node_modules/
dist-electron/
dist-renderer/
.vite/
.npm-cache/
coverage/
*.log
```

- [ ] **Step 2: Install dependencies**

Run:

```powershell
npm install --cache .npm-cache --no-audit --no-fund
```

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 3: Run initial checks**

Run:

```powershell
npm run typecheck
```

Expected: TypeScript reports missing source files if later tasks have not run yet, or passes after the scaffold is complete.

- [ ] **Step 4: Commit scaffold**

```powershell
git add package.json package-lock.json tsconfig.json tsconfig.node.json tsconfig.web.json vite.config.ts index.html .gitignore
git commit -m "chore: scaffold DailyDeck app"
```

### Task 2: Shared Types and Defaults

**Files:**
- Create: `src/shared/types.ts`
- Create: `src/shared/defaults.ts`
- Test: `tests/tasks-notes.test.ts`

- [ ] **Step 1: Write shared type contracts**

Create `src/shared/types.ts`:

```ts
export type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

export type ClipboardItem = {
  id: string;
  text: string;
  pinned: boolean;
  createdAt: string;
  lastCopiedAt: string;
};

export type AppSettings = {
  clipboardRecordingEnabled: boolean;
  clipboardMaxItems: number;
  launchAtLogin: boolean;
};

export type MetricStatus = "ok" | "warn" | "critical" | "unavailable";

export type Metric = {
  label: string;
  value: string;
  detail: string;
  status: MetricStatus;
};

export type ProcessUsage = {
  name: string;
  cpuPercent: number;
  memoryMb: number;
};

export type SystemSnapshot = {
  capturedAt: string;
  metrics: {
    cpu: Metric;
    memory: Metric;
    disk: Metric;
    network: Metric;
  };
  processes: ProcessUsage[];
  notices: string[];
};

export type PersistedData = {
  tasks: Task[];
  notes: Note[];
  clipboardItems: ClipboardItem[];
  settings: AppSettings;
};
```

Create `src/shared/defaults.ts`:

```ts
import type { AppSettings, PersistedData } from "./types";

export const defaultSettings: AppSettings = {
  clipboardRecordingEnabled: true,
  clipboardMaxItems: 80,
  launchAtLogin: false
};

export const createInitialData = (): PersistedData => ({
  tasks: [],
  notes: [],
  clipboardItems: [],
  settings: { ...defaultSettings }
});
```

- [ ] **Step 2: Add a focused contract test**

Create `tests/tasks-notes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialData, defaultSettings } from "../src/shared/defaults";

describe("shared defaults", () => {
  it("creates isolated initial data", () => {
    const first = createInitialData();
    const second = createInitialData();

    first.tasks.push({
      id: "task-1",
      text: "Check CPU",
      completed: false,
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z"
    });

    expect(second.tasks).toEqual([]);
    expect(first.settings).toEqual(defaultSettings);
    expect(first.settings).not.toBe(defaultSettings);
  });
});
```

- [ ] **Step 3: Run the test**

Run:

```powershell
npm test -- tests/tasks-notes.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit shared contracts**

```powershell
git add src/shared/types.ts src/shared/defaults.ts tests/tasks-notes.test.ts
git commit -m "feat: add shared DailyDeck types"
```

### Task 3: Local JSON Storage

**Files:**
- Create: `electron/services/storage.ts`
- Test: `tests/storage.test.ts`

- [ ] **Step 1: Write storage tests**

Create `tests/storage.test.ts`:

```ts
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { JsonStore } from "../electron/services/storage";

const tempDirs: string[] = [];

async function makeStore() {
  const dir = await mkdtemp(join(tmpdir(), "dailydeck-test-"));
  tempDirs.push(dir);
  return new JsonStore(join(dir, "data.json"));
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("JsonStore", () => {
  it("starts with initial data when no file exists", async () => {
    const store = await makeStore();
    const data = await store.read();

    expect(data.tasks).toEqual([]);
    expect(data.settings.clipboardRecordingEnabled).toBe(true);
  });

  it("persists task changes", async () => {
    const store = await makeStore();

    await store.update((data) => ({
      ...data,
      tasks: [
        {
          id: "task-1",
          text: "Write plan",
          completed: false,
          createdAt: "2026-05-21T00:00:00.000Z",
          updatedAt: "2026-05-21T00:00:00.000Z"
        }
      ]
    }));

    const reloaded = await store.read();
    expect(reloaded.tasks).toHaveLength(1);
    expect(reloaded.tasks[0]?.text).toBe("Write plan");
  });
});
```

- [ ] **Step 2: Implement JSON store**

Create `electron/services/storage.ts`:

```ts
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createInitialData } from "../../src/shared/defaults";
import type { PersistedData } from "../../src/shared/types";

export class JsonStore {
  private cache: PersistedData | null = null;

  constructor(private readonly filePath: string) {}

  async read(): Promise<PersistedData> {
    if (this.cache) {
      return structuredClone(this.cache);
    }

    try {
      const raw = await readFile(this.filePath, "utf8");
      this.cache = { ...createInitialData(), ...JSON.parse(raw) } as PersistedData;
    } catch {
      this.cache = createInitialData();
      await this.write(this.cache);
    }

    return structuredClone(this.cache);
  }

  async update(mutator: (data: PersistedData) => PersistedData): Promise<PersistedData> {
    const current = await this.read();
    const next = mutator(current);
    await this.write(next);
    return structuredClone(next);
  }

  private async write(data: PersistedData): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
    await rename(tempPath, this.filePath);
    this.cache = structuredClone(data);
  }
}
```

- [ ] **Step 3: Run storage tests**

Run:

```powershell
npm test -- tests/storage.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit storage**

```powershell
git add electron/services/storage.ts tests/storage.test.ts
git commit -m "feat: add local JSON storage"
```

### Task 4: Clipboard History Service

**Files:**
- Create: `electron/services/clipboard.ts`
- Test: `tests/clipboard-history.test.ts`

- [ ] **Step 1: Write clipboard history tests**

Create `tests/clipboard-history.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { addClipboardText, clearClipboardItems, setClipboardPinned } from "../electron/services/clipboard";
import { createInitialData } from "../src/shared/defaults";

describe("clipboard history operations", () => {
  it("does not add duplicate consecutive text", () => {
    const first = addClipboardText(createInitialData(), "hello", "2026-05-21T00:00:00.000Z");
    const second = addClipboardText(first, "hello", "2026-05-21T00:00:01.000Z");

    expect(second.clipboardItems).toHaveLength(1);
    expect(second.clipboardItems[0]?.lastCopiedAt).toBe("2026-05-21T00:00:01.000Z");
  });

  it("keeps pinned items when clearing unpinned history", () => {
    const data = addClipboardText(createInitialData(), "keep", "2026-05-21T00:00:00.000Z");
    const pinned = setClipboardPinned(data, data.clipboardItems[0]!.id, true);
    const withSecond = addClipboardText(pinned, "remove", "2026-05-21T00:00:01.000Z");

    const cleared = clearClipboardItems(withSecond, false);

    expect(cleared.clipboardItems.map((item) => item.text)).toEqual(["keep"]);
  });
});
```

- [ ] **Step 2: Implement clipboard helpers and polling class**

Create `electron/services/clipboard.ts`:

```ts
import type { Clipboard } from "electron";
import type { ClipboardItem, PersistedData } from "../../src/shared/types";
import { JsonStore } from "./storage";

const createId = () => crypto.randomUUID();

export function addClipboardText(data: PersistedData, text: string, now: string): PersistedData {
  const trimmed = text.trim();
  if (!trimmed || !data.settings.clipboardRecordingEnabled) {
    return data;
  }

  const [latest, ...rest] = data.clipboardItems;
  if (latest?.text === trimmed) {
    return {
      ...data,
      clipboardItems: [{ ...latest, lastCopiedAt: now }, ...rest]
    };
  }

  const item: ClipboardItem = {
    id: createId(),
    text: trimmed,
    pinned: false,
    createdAt: now,
    lastCopiedAt: now
  };

  const pinned = data.clipboardItems.filter((entry) => entry.pinned);
  const unpinned = [item, ...data.clipboardItems.filter((entry) => !entry.pinned)].slice(
    0,
    data.settings.clipboardMaxItems
  );

  return {
    ...data,
    clipboardItems: [...pinned, ...unpinned].sort((a, b) => Number(b.pinned) - Number(a.pinned))
  };
}

export function setClipboardPinned(data: PersistedData, id: string, pinned: boolean): PersistedData {
  return {
    ...data,
    clipboardItems: data.clipboardItems.map((item) => (item.id === id ? { ...item, pinned } : item))
  };
}

export function clearClipboardItems(data: PersistedData, includePinned: boolean): PersistedData {
  return {
    ...data,
    clipboardItems: includePinned ? [] : data.clipboardItems.filter((item) => item.pinned)
  };
}

export class ClipboardRecorder {
  private timer: NodeJS.Timeout | null = null;
  private lastSeen = "";

  constructor(
    private readonly clipboard: Pick<Clipboard, "readText" | "writeText">,
    private readonly store: JsonStore
  ) {}

  start(intervalMs = 1000): void {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      void this.capture();
    }, intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async capture(): Promise<void> {
    const text = this.clipboard.readText();
    if (!text || text === this.lastSeen) {
      return;
    }

    this.lastSeen = text;
    await this.store.update((data) => addClipboardText(data, text, new Date().toISOString()));
  }

  writeText(text: string): void {
    this.lastSeen = text;
    this.clipboard.writeText(text);
  }
}
```

- [ ] **Step 3: Run clipboard tests**

Run:

```powershell
npm test -- tests/clipboard-history.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit clipboard service**

```powershell
git add electron/services/clipboard.ts tests/clipboard-history.test.ts
git commit -m "feat: add clipboard history service"
```

### Task 5: System Metrics Service

**Files:**
- Create: `electron/services/system.ts`

- [ ] **Step 1: Implement system snapshot service**

Create `electron/services/system.ts`:

```ts
import si from "systeminformation";
import type { Metric, MetricStatus, ProcessUsage, SystemSnapshot } from "../../src/shared/types";

function statusFor(percent: number): MetricStatus {
  if (!Number.isFinite(percent)) return "unavailable";
  if (percent >= 90) return "critical";
  if (percent >= 75) return "warn";
  return "ok";
}

function percentMetric(label: string, percent: number, detail: string): Metric {
  return {
    label,
    value: `${Math.round(percent)}%`,
    detail,
    status: statusFor(percent)
  };
}

export async function getSystemSnapshot(): Promise<SystemSnapshot> {
  try {
    const [load, memory, fsSize, networkStats, processes] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.processes()
    ]);

    const memoryPercent = (memory.used / memory.total) * 100;
    const primaryDisk = fsSize[0];
    const diskPercent = primaryDisk ? primaryDisk.use : 0;
    const network = networkStats[0];
    const rx = network ? network.rx_sec / 1024 : 0;
    const tx = network ? network.tx_sec / 1024 : 0;

    const topProcesses: ProcessUsage[] = processes.list
      .slice()
      .sort((a, b) => b.memRss - a.memRss)
      .slice(0, 6)
      .map((process) => ({
        name: process.name,
        cpuPercent: Number(process.cpu.toFixed(1)),
        memoryMb: Math.round(process.memRss / 1024)
      }));

    const notices: string[] = [];
    if (load.currentLoad >= 85) notices.push("CPU load is high.");
    if (memoryPercent >= 85) notices.push("Memory usage is high.");
    if (diskPercent >= 90) notices.push("Primary disk is nearly full.");

    return {
      capturedAt: new Date().toISOString(),
      metrics: {
        cpu: percentMetric("CPU", load.currentLoad, "Current load"),
        memory: percentMetric(
          "Memory",
          memoryPercent,
          `${Math.round(memory.used / 1024 / 1024 / 1024)} / ${Math.round(memory.total / 1024 / 1024 / 1024)} GB`
        ),
        disk: percentMetric("Disk", diskPercent, primaryDisk?.mount ?? "Primary drive"),
        network: {
          label: "Network",
          value: `${Math.round(rx)} KB/s`,
          detail: `Up ${Math.round(tx)} KB/s`,
          status: "ok"
        }
      },
      processes: topProcesses,
      notices
    };
  } catch {
    const unavailable: Metric = {
      label: "Unavailable",
      value: "--",
      detail: "Unable to read system data",
      status: "unavailable"
    };

    return {
      capturedAt: new Date().toISOString(),
      metrics: {
        cpu: { ...unavailable, label: "CPU" },
        memory: { ...unavailable, label: "Memory" },
        disk: { ...unavailable, label: "Disk" },
        network: { ...unavailable, label: "Network" }
      },
      processes: [],
      notices: ["System metrics are unavailable."]
    };
  }
}
```

- [ ] **Step 2: Run typecheck**

Run:

```powershell
npm run typecheck
```

Expected: PASS after Electron and renderer entry files exist; before then, only expected missing-file errors from tasks not yet completed are acceptable.

- [ ] **Step 3: Commit metrics service**

```powershell
git add electron/services/system.ts
git commit -m "feat: add system metrics service"
```

### Task 6: Electron Main, Preload, and IPC

**Files:**
- Create: `electron/main.ts`
- Create: `electron/preload.ts`
- Create: `electron/ipc.ts`
- Modify: `src/renderer/vite-env.d.ts`

- [ ] **Step 1: Implement IPC handlers**

Create `electron/ipc.ts`:

```ts
import { ipcMain } from "electron";
import type { ClipboardRecorder } from "./services/clipboard";
import { clearClipboardItems, setClipboardPinned } from "./services/clipboard";
import type { JsonStore } from "./services/storage";
import { getSystemSnapshot } from "./services/system";

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

export function registerIpc(store: JsonStore, clipboardRecorder: ClipboardRecorder): void {
  ipcMain.handle("system:getSnapshot", () => getSystemSnapshot());

  ipcMain.handle("data:get", () => store.read());

  ipcMain.handle("task:create", async (_event, text: string) =>
    store.update((data) => ({
      ...data,
      tasks: [
        {
          id: id(),
          text: text.trim(),
          completed: false,
          createdAt: now(),
          updatedAt: now()
        },
        ...data.tasks
      ].filter((task) => task.text)
    }))
  );

  ipcMain.handle("task:update", async (_event, taskId: string, updates: { text?: string; completed?: boolean }) =>
    store.update((data) => ({
      ...data,
      tasks: data.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates, text: updates.text?.trim() ?? task.text, updatedAt: now() } : task
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
    store.update((data) => ({
      ...data,
      notes: [
        {
          id: id(),
          text: text.trim(),
          createdAt: now(),
          updatedAt: now()
        },
        ...data.notes
      ].filter((note) => note.text)
    }))
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
```

- [ ] **Step 2: Implement preload bridge**

Create `electron/preload.ts`:

```ts
import { contextBridge, ipcRenderer } from "electron";
import type { PersistedData, SystemSnapshot } from "../src/shared/types";

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
  pinClipboardItem: (id: string, pinned: boolean): Promise<PersistedData> => ipcRenderer.invoke("clipboard:pin", id, pinned),
  deleteClipboardItem: (id: string): Promise<PersistedData> => ipcRenderer.invoke("clipboard:delete", id),
  clearClipboardItems: (includePinned: boolean): Promise<PersistedData> =>
    ipcRenderer.invoke("clipboard:clear", includePinned),
  updateSettings: (updates: Partial<PersistedData["settings"]>): Promise<PersistedData> =>
    ipcRenderer.invoke("settings:update", updates)
};

contextBridge.exposeInMainWorld("dailyDeck", api);

export type DailyDeckApi = typeof api;
```

Create `src/renderer/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

import type { DailyDeckApi } from "../../electron/preload";

declare global {
  interface Window {
    dailyDeck: DailyDeckApi;
  }
}
```

- [ ] **Step 3: Implement Electron app lifecycle**

Create `electron/main.ts`:

```ts
import { app, BrowserWindow, Menu, Tray, clipboard, nativeImage } from "electron";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ClipboardRecorder } from "./services/clipboard";
import { JsonStore } from "./services/storage";
import { registerIpc } from "./ipc";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let recorder: ClipboardRecorder | null = null;

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
    if (!app.isQuiting) {
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
      { label: "Quit", click: () => {
        app.isQuiting = true;
        app.quit();
      } }
    ])
  );
}

declare module "electron" {
  interface App {
    isQuiting?: boolean;
  }
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
  app.isQuiting = true;
  recorder?.stop();
});
```

- [ ] **Step 4: Run typecheck**

Run:

```powershell
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit Electron shell**

```powershell
git add electron/main.ts electron/preload.ts electron/ipc.ts src/renderer/vite-env.d.ts
git commit -m "feat: wire Electron main process"
```

### Task 7: Renderer Dashboard UI

**Files:**
- Create: `src/renderer/main.tsx`
- Create: `src/renderer/api.ts`
- Create: `src/renderer/App.tsx`
- Create: `src/renderer/components/MetricTile.tsx`
- Create: `src/renderer/components/TaskPanel.tsx`
- Create: `src/renderer/components/NotesPanel.tsx`
- Create: `src/renderer/components/ClipboardPanel.tsx`
- Create: `src/renderer/components/ProcessPanel.tsx`
- Create: `src/renderer/components/StatusBar.tsx`
- Create: `src/renderer/styles.css`

- [ ] **Step 1: Create renderer API wrapper**

Create `src/renderer/api.ts`:

```ts
export const dailyDeckApi = window.dailyDeck;
```

Create `src/renderer/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 2: Create metric and process components**

Create `src/renderer/components/MetricTile.tsx`:

```tsx
import type { Metric } from "../../shared/types";

type Props = {
  metric: Metric;
};

export function MetricTile({ metric }: Props) {
  return (
    <section className={`metric metric-${metric.status}`}>
      <div className="metric-label">{metric.label}</div>
      <div className="metric-value">{metric.value}</div>
      <div className="metric-detail">{metric.detail}</div>
    </section>
  );
}
```

Create `src/renderer/components/ProcessPanel.tsx`:

```tsx
import type { ProcessUsage } from "../../shared/types";

type Props = {
  processes: ProcessUsage[];
};

export function ProcessPanel({ processes }: Props) {
  return (
    <section className="panel dark-panel">
      <div className="panel-header">
        <h2>High usage</h2>
      </div>
      <div className="process-list">
        {processes.map((process) => (
          <div className="process-row" key={`${process.name}-${process.memoryMb}`}>
            <span>{process.name}</span>
            <span>{process.cpuPercent}% CPU</span>
            <span>{process.memoryMb} MB</span>
          </div>
        ))}
        {processes.length === 0 ? <p className="empty dark-empty">No process data available.</p> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create task and note components**

Create `src/renderer/components/TaskPanel.tsx`:

```tsx
import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Task } from "../../shared/types";

type Props = {
  tasks: Task[];
  onCreate: (text: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};

export function TaskPanel({ tasks, onCreate, onToggle, onDelete }: Props) {
  const [text, setText] = useState("");

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Today</h2>
      </div>
      <form
        className="entry-row"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate(text);
          setText("");
        }}
      >
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Add a task" />
        <button aria-label="Add task" type="submit"><Plus size={16} /></button>
      </form>
      <div className="list">
        {tasks.map((task) => (
          <div className="item-row" key={task.id}>
            <button aria-label="Toggle task" onClick={() => onToggle(task.id, !task.completed)}>
              <Check size={16} />
            </button>
            <span className={task.completed ? "done" : ""}>{task.text}</span>
            <button aria-label="Delete task" onClick={() => onDelete(task.id)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}
```

Create `src/renderer/components/NotesPanel.tsx`:

```tsx
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Note } from "../../shared/types";

type Props = {
  notes: Note[];
  onCreate: (text: string) => void;
  onDelete: (id: string) => void;
};

export function NotesPanel({ notes, onCreate, onDelete }: Props) {
  const [text, setText] = useState("");

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Quick notes</h2>
      </div>
      <form
        className="entry-row"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate(text);
          setText("");
        }}
      >
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Capture a note" />
        <button aria-label="Add note" type="submit"><Plus size={16} /></button>
      </form>
      <div className="list">
        {notes.map((note) => (
          <div className="item-row" key={note.id}>
            <span>{note.text}</span>
            <button aria-label="Delete note" onClick={() => onDelete(note.id)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create clipboard and status components**

Create `src/renderer/components/ClipboardPanel.tsx`:

```tsx
import { Copy, Pin, Trash2 } from "lucide-react";
import type { ClipboardItem } from "../../shared/types";

type Props = {
  items: ClipboardItem[];
  onCopy: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
  onClear: (includePinned: boolean) => void;
};

export function ClipboardPanel({ items, onCopy, onPin, onDelete, onClear }: Props) {
  return (
    <section className="panel clipboard-panel">
      <div className="panel-header">
        <h2>Clipboard</h2>
        <div className="button-group">
          <button onClick={() => onClear(false)}>Clear</button>
          <button onClick={() => onClear(true)}>Clear all</button>
        </div>
      </div>
      <div className="clipboard-list">
        {items.map((item) => (
          <article className={item.pinned ? "clipboard-item pinned" : "clipboard-item"} key={item.id}>
            <p>{item.text}</p>
            <div className="clipboard-actions">
              <button aria-label="Copy item" onClick={() => onCopy(item.id)}><Copy size={15} /></button>
              <button aria-label="Pin item" onClick={() => onPin(item.id, !item.pinned)}><Pin size={15} /></button>
              <button aria-label="Delete item" onClick={() => onDelete(item.id)}><Trash2 size={15} /></button>
            </div>
          </article>
        ))}
        {items.length === 0 ? <p className="empty">Clipboard text will appear here.</p> : null}
      </div>
    </section>
  );
}
```

Create `src/renderer/components/StatusBar.tsx`:

```tsx
type Props = {
  notices: string[];
  clipboardEnabled: boolean;
  onToggleClipboard: () => void;
};

export function StatusBar({ notices, clipboardEnabled, onToggleClipboard }: Props) {
  return (
    <footer className="status-bar">
      <span>{notices.length > 0 ? notices.join(" ") : "System looks steady."}</span>
      <button onClick={onToggleClipboard}>{clipboardEnabled ? "Pause clipboard" : "Resume clipboard"}</button>
    </footer>
  );
}
```

- [ ] **Step 5: Compose the app**

Create `src/renderer/App.tsx`:

```tsx
import { useEffect, useState } from "react";
import type { PersistedData, SystemSnapshot } from "../shared/types";
import { createInitialData } from "../shared/defaults";
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
```

- [ ] **Step 6: Add Claude-inspired utility styling**

Create `src/renderer/styles.css`:

```css
:root {
  color: #23201d;
  background: #faf9f5;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 760px;
  background: #faf9f5;
}

button,
input {
  font: inherit;
}

button {
  border: 1px solid #ded8cc;
  border-radius: 8px;
  background: #fffaf1;
  color: #28231f;
  min-height: 34px;
  padding: 7px 10px;
  cursor: pointer;
}

button:hover {
  border-color: #cc785c;
}

input {
  width: 100%;
  border: 1px solid #ded8cc;
  border-radius: 8px;
  background: #fffdf8;
  color: #28231f;
  min-height: 36px;
  padding: 8px 10px;
}

.app-shell {
  min-height: 100vh;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-header h1,
.panel h2 {
  margin: 0;
  font-weight: 600;
  letter-spacing: 0;
}

.app-header h1 {
  font-size: 24px;
}

.app-header p {
  margin: 3px 0 0;
  color: #766f66;
  font-size: 13px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.metric,
.panel {
  border: 1px solid #e7e0d4;
  border-radius: 8px;
  background: #fffaf1;
}

.metric {
  min-height: 92px;
  padding: 12px;
}

.metric-label,
.metric-detail,
.empty {
  color: #766f66;
  font-size: 12px;
}

.metric-value {
  margin: 6px 0;
  font-size: 26px;
  font-weight: 650;
}

.metric-warn {
  border-color: #cc785c;
}

.metric-critical {
  border-color: #a8422f;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 12px;
  min-height: 0;
}

.left-stack {
  display: grid;
  gap: 12px;
}

.panel {
  padding: 12px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.panel h2 {
  font-size: 15px;
}

.entry-row,
.item-row,
.process-row {
  display: grid;
  align-items: center;
  gap: 8px;
}

.entry-row {
  grid-template-columns: 1fr 38px;
}

.item-row {
  grid-template-columns: 38px 1fr 38px;
  min-height: 40px;
  border-bottom: 1px solid #eee6da;
}

.list {
  margin-top: 8px;
}

.done {
  color: #8a8277;
  text-decoration: line-through;
}

.clipboard-panel {
  min-height: 420px;
}

.button-group {
  display: flex;
  gap: 6px;
}

.clipboard-list {
  display: grid;
  gap: 8px;
  max-height: 480px;
  overflow: auto;
}

.clipboard-item {
  border: 1px solid #eee6da;
  border-radius: 8px;
  padding: 9px;
  background: #fffdf8;
}

.clipboard-item.pinned {
  border-color: #cc785c;
}

.clipboard-item p {
  margin: 0 0 8px;
  max-height: 52px;
  overflow: hidden;
  color: #302b26;
  font-size: 13px;
  line-height: 1.35;
}

.clipboard-actions {
  display: flex;
  gap: 6px;
}

.dark-panel {
  background: #242528;
  color: #f8f1e7;
  border-color: #242528;
}

.process-row {
  grid-template-columns: 1fr 80px 90px;
  min-height: 30px;
  color: #eee7dc;
  font-size: 12px;
}

.dark-empty {
  color: #bdb5aa;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #5f574e;
  font-size: 12px;
}
```

- [ ] **Step 7: Build renderer and Electron**

Run:

```powershell
npm run build
```

Expected: PASS and both `dist-electron/` and `dist-renderer/` are created.

- [ ] **Step 8: Commit renderer**

```powershell
git add src/renderer
git commit -m "feat: build DailyDeck dashboard UI"
```

### Task 8: Verification and Desktop Run

**Files:**
- Modify only if verification exposes defects.

- [ ] **Step 1: Run automated verification**

Run:

```powershell
npm test
npm run typecheck
npm run build
```

Expected: all commands PASS.

- [ ] **Step 2: Start the desktop app**

Run:

```powershell
npm start
```

Expected:

- DailyDeck window opens.
- Top metric tiles render.
- Task entry adds a task.
- Note entry adds a note.
- Copying text in Windows creates clipboard entries.
- Pause clipboard stops new entries.
- Copy button writes old text back to the Windows clipboard.
- Tray menu can hide, show, and quit the app.

- [ ] **Step 3: Fix any verification defects**

For each defect:

```powershell
git status --short
npm test
npm run typecheck
npm run build
```

Expected: defect is fixed and verification passes before committing.

- [ ] **Step 4: Commit verification fixes**

```powershell
git add .
git commit -m "fix: stabilize DailyDeck desktop verification"
```

### Task 9: GitHub Repository Sync

**Files:**
- No source files required unless adding GitHub metadata.

- [ ] **Step 1: Create or receive the GitHub repository**

Because this environment currently has no `gh` command and the GitHub connector available here cannot create repositories, use one of these paths:

- User creates an empty GitHub repository named `dailydeck` and provides the URL.
- Install and authenticate GitHub CLI, then run `gh repo create dailydeck --private --source . --remote origin --push`.

- [ ] **Step 2: Connect local repository to remote**

If the user provides a remote URL:

```powershell
git remote add origin <REMOTE_URL>
git branch -M main
git push -u origin main
```

Expected: local commits are pushed to GitHub.

- [ ] **Step 3: Use GitHub for future sync**

After remote setup, future changes should follow:

```powershell
git status --short
git add <changed-files>
git commit -m "<clear message>"
git push
```

Expected: GitHub reflects each implemented milestone.

## Self-Review

- Spec coverage: performance overview is covered by Task 5 and Task 7; process list by Task 5 and Task 7; tasks and notes by Task 2, Task 3, Task 6, and Task 7; clipboard history by Task 4, Task 6, and Task 7; tray support by Task 6; local persistence by Task 3.
- Scope control: pomodoro, launchers, cloud sync, accounts, process termination, advanced historical charts, and non-text clipboard capture are not included.
- Placeholder scan: no implementation step depends on `TBD`, `TODO`, or undefined future work.
- Type consistency: shared types in `src/shared/types.ts` are used by storage, clipboard, system, preload, and renderer components.
- GitHub gap: repository creation is explicitly blocked by unavailable local `gh` and missing connector support; the plan includes the concrete handoff path for remote sync.
