import type { AppSettings, PersistedData } from "./types.js";

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
