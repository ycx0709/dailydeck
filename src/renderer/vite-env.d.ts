/// <reference types="vite/client" />

import type { DailyDeckApi } from "../../electron/preload";

declare global {
  interface Window {
    dailyDeck: DailyDeckApi;
  }
}
