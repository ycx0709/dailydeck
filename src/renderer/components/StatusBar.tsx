import type { AppSettings } from "../../shared/types";

type Props = {
  language: AppSettings["language"];
  notices: string[];
  clipboardEnabled: boolean;
  onToggleClipboard: () => void;
};

const copy = {
  zh: {
    quickPaste: "Ctrl + Shift + V 打开快速粘贴面板",
    pause: "暂停记录",
    resume: "恢复记录"
  },
  en: {
    quickPaste: "Ctrl + Shift + V opens Quick Paste",
    pause: "Pause",
    resume: "Resume"
  }
};

export function StatusBar({ language, notices, clipboardEnabled, onToggleClipboard }: Props) {
  const text = copy[language ?? "zh"];

  return (
    <footer className="status-bar">
      <span>{notices.length > 0 ? notices.join(" ") : text.quickPaste}</span>
      <button onClick={onToggleClipboard}>{clipboardEnabled ? text.pause : text.resume}</button>
    </footer>
  );
}
