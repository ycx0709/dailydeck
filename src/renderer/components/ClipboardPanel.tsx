import { Copy, Pin, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  classifyClipboardText,
  clipboardCategoryLabels,
  processClipboardText,
  searchClipboardItems,
  type ClipboardCategory
} from "../../shared/clipboardTools";
import type { ClipboardItem } from "../../shared/types";

type Props = {
  items: ClipboardItem[];
  onCopy: (id: string) => void;
  onCopyText: (text: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
  onClear: (includePinned: boolean) => void;
};

const categories: ClipboardCategory[] = ["all", "favorite", "link", "code", "text", "other"];

export function ClipboardPanel({ items, onCopy, onCopyText, onPin, onDelete, onClear }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ClipboardCategory>("all");
  const filteredItems = useMemo(() => searchClipboardItems(items, query, category), [items, query, category]);

  return (
    <section className="panel clipboard-panel">
      <div className="panel-header">
        <h2>剪贴板 Clipboard</h2>
        <div className="button-group">
          <button onClick={() => onClear(false)}>清空未收藏</button>
          <button onClick={() => onClear(true)}>清空全部</button>
        </div>
      </div>

      <div className="clipboard-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索剪贴板内容" />
        <div className="category-tabs" role="tablist" aria-label="剪贴板分组">
          {categories.map((entry) => (
            <button
              className={entry === category ? "active" : ""}
              key={entry}
              onClick={() => setCategory(entry)}
              type="button"
            >
              {clipboardCategoryLabels[entry]}
            </button>
          ))}
        </div>
      </div>

      <div className="clipboard-list">
        {filteredItems.map((item) => {
          const itemCategory = classifyClipboardText(item.text);
          return (
          <article className={item.pinned ? "clipboard-item pinned" : "clipboard-item"} key={item.id}>
            <div className="clipboard-meta">
              <span>{clipboardCategoryLabels[itemCategory]}</span>
              {item.pinned ? <strong>已收藏</strong> : null}
            </div>
            <p>{item.text}</p>
            <div className="clipboard-actions">
              <button aria-label="Copy item" onClick={() => onCopy(item.id)}>
                <Copy size={15} />
                复制
              </button>
              <button aria-label="Pin item" onClick={() => onPin(item.id, !item.pinned)}>
                <Pin size={15} />
                {item.pinned ? "取消收藏" : "收藏"}
              </button>
              <button onClick={() => onCopyText(processClipboardText(item.text, "removeLineBreaks"))}>去换行</button>
              <button onClick={() => onCopyText(processClipboardText(item.text, "normalizeWhitespace"))}>
                去空格
              </button>
              <button onClick={() => onCopyText(processClipboardText(item.text, "upper"))}>大写</button>
              <button onClick={() => onCopyText(processClipboardText(item.text, "lower"))}>小写</button>
              <button onClick={() => onCopyText(processClipboardText(item.text, "formatJson"))}>JSON格式化</button>
              <button aria-label="Delete item" className="danger" onClick={() => onDelete(item.id)}>
                <Trash2 size={15} />
                删除
              </button>
            </div>
          </article>
          );
        })}
        {filteredItems.length === 0 ? <p className="empty">复制文本后会显示在这里</p> : null}
      </div>
    </section>
  );
}
