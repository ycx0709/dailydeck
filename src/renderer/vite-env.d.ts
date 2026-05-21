/// <reference types="vite/client" />

import type { DailyDeckApi } from "../../electron/preload.cjs";

declare global {
  interface Window {
    dailyDeck: DailyDeckApi;
  }
}
