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
