import type { Clipboard } from "electron";
import type { ClipboardItem, PersistedData } from "../../src/shared/types.js";
import { JsonStore } from "./storage.js";

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
