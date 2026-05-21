type Props = {
  notices: string[];
  clipboardEnabled: boolean;
  onToggleClipboard: () => void;
};

export function StatusBar({ notices, clipboardEnabled, onToggleClipboard }: Props) {
  return (
    <footer className="status-bar">
      <span>{notices.length > 0 ? notices.join(" ") : "Ctrl + Shift + V 打开快速粘贴面板"}</span>
      <button onClick={onToggleClipboard}>{clipboardEnabled ? "暂停记录" : "恢复记录"}</button>
    </footer>
  );
}
