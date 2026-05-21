import type { AppSettings, PersistedData } from "./types.js";

export const defaultSettings: AppSettings = {
  clipboardRecordingEnabled: true,
  clipboardMaxItems: 80,
  launchAtLogin: false,
  language: "zh",
  deepSeekModel: "deepseek-v4-flash"
};

export const createInitialData = (): PersistedData => ({
  tasks: [],
  notes: [],
  clipboardItems: [],
  settings: { ...defaultSettings }
});
