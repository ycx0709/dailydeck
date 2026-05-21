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
              <button aria-label="Copy item" onClick={() => onCopy(item.id)}>
                <Copy size={15} />
              </button>
              <button aria-label="Pin item" onClick={() => onPin(item.id, !item.pinned)}>
                <Pin size={15} />
              </button>
              <button aria-label="Delete item" onClick={() => onDelete(item.id)}>
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}
        {items.length === 0 ? <p className="empty">Clipboard text will appear here.</p> : null}
      </div>
    </section>
  );
}
