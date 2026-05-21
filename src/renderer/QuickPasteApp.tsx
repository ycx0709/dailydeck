import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createInitialData } from "../shared/defaults";
import type { ClipboardItem, PersistedData } from "../shared/types";
import { clipboardCategoryLabels, searchClipboardItems } from "../shared/clipboardTools";

const dailyDeckApi = window.dailyDeck;

export function QuickPasteApp() {
  const [data, setData] = useState<PersistedData>(() => createInitialData());
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const items = useMemo(
    () => searchClipboardItems(data.clipboardItems, query, "all").slice(0, 24),
    [data.clipboardItems, query]
  );

  const loadData = useCallback(async () => {
    setData(await dailyDeckApi.getData());
    setSelectedIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    void loadData();
    return dailyDeckApi.onQuickPasteShown(() => {
      void loadData();
    });
  }, [loadData]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const copyAndClose = async (item: ClipboardItem | undefined) => {
    if (!item) return;
    await dailyDeckApi.copyClipboardItem(item.id);
    await dailyDeckApi.hideQuickPaste();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      void dailyDeckApi.hideQuickPaste();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) => Math.min(current + 1, Math.max(items.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      void copyAndClose(items[selectedIndex]);
    }
  };

  return (
    <main className="quick-paste-shell">
      <header className="quick-paste-header">
        <div>
          <h1>Quick Paste 快速粘贴</h1>
          <p>搜索后回车复制到剪贴板</p>
        </div>
        <button aria-label="关闭快速粘贴面板" onClick={() => void dailyDeckApi.hideQuickPaste()}>
          Esc
        </button>
      </header>

      <input
        ref={inputRef}
        className="quick-paste-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="搜索剪贴板内容"
      />

      <section className="quick-paste-list" aria-label="快速粘贴列表">
        {items.map((item, index) => {
          const category = clipboardCategoryLabels[item.pinned ? "favorite" : "all"];
          return (
            <button
              className={`quick-paste-item ${index === selectedIndex ? "selected" : ""}`}
              key={item.id}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => void copyAndClose(item)}
            >
              <span>{item.text}</span>
              <small>{item.pinned ? category : new Date(item.lastCopiedAt).toLocaleString()}</small>
            </button>
          );
        })}
        {items.length === 0 && <p className="quick-paste-empty">没有匹配的剪贴板内容</p>}
      </section>

      <footer className="quick-paste-footer">↑↓ 选择 · Enter 复制 · Esc 关闭</footer>
    </main>
  );
}
