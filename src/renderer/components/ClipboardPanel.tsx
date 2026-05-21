import { Copy, Pin, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  classifyClipboardText,
  clipboardCategoryLabels,
  searchClipboardItems,
  type ClipboardCategory
} from "../../shared/clipboardTools";
import type { AiClipboardAnalysis, ClipboardItem } from "../../shared/types";

type Props = {
  items: ClipboardItem[];
  onCopy: (id: string) => void;
  onCopyText: (text: string) => void;
  onAnalyze: (text: string) => Promise<AiClipboardAnalysis>;
  onRename: (id: string, title: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
  onClear: (includePinned: boolean) => void;
};

const categories: ClipboardCategory[] = ["all", "favorite", "link", "code", "text", "other"];

export function ClipboardPanel({
  items,
  onCopy,
  onCopyText,
  onAnalyze,
  onRename,
  onPin,
  onDelete,
  onClear
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ClipboardCategory>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [analysisById, setAnalysisById] = useState<Record<string, AiClipboardAnalysis>>({});
  const [errorById, setErrorById] = useState<Record<string, string>>({});
  const filteredItems = useMemo(() => searchClipboardItems(items, query, category), [items, query, category]);

  const startRename = (item: ClipboardItem) => {
    setEditingId(item.id);
    setDraftTitle(item.title ?? "");
  };

  const saveRename = (itemId: string) => {
    onRename(itemId, draftTitle);
    setEditingId(null);
    setDraftTitle("");
  };

  const analyzeItem = async (item: ClipboardItem) => {
    setLoadingId(item.id);
    setErrorById((current) => ({ ...current, [item.id]: "" }));
    try {
      const result = await onAnalyze(item.text);
      setAnalysisById((current) => ({ ...current, [item.id]: result }));
    } catch (error) {
      setErrorById((current) => ({
        ...current,
        [item.id]: error instanceof Error ? error.message : "AI 拆分失败"
      }));
    } finally {
      setLoadingId(null);
    }
  };

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
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称或剪贴板内容" />
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
          const analysis = analysisById[item.id];
          const isEditing = editingId === item.id;
          const isLongText = item.text.length > 180 || item.text.includes("\n");
          const isExpanded = expandedIds.has(item.id);
          return (
            <article className={item.pinned ? "clipboard-item pinned" : "clipboard-item"} key={item.id}>
              <div className="clipboard-meta">
                <span>{clipboardCategoryLabels[itemCategory]}</span>
                {item.pinned ? <strong>已收藏</strong> : null}
              </div>

              {isEditing ? (
                <div className="clipboard-title-editor">
                  <input
                    aria-label="收藏名称"
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveRename(item.id);
                      if (event.key === "Escape") setEditingId(null);
                    }}
                    placeholder="给这条内容命名"
                  />
                  <button onClick={() => saveRename(item.id)}>保存</button>
                  <button onClick={() => setEditingId(null)}>取消</button>
                </div>
              ) : item.title ? (
                <h3 className="clipboard-title">{item.title}</h3>
              ) : null}

              <p className={`clipboard-text ${isLongText && !isExpanded ? "collapsed" : "expanded"}`}>{item.text}</p>
              {isLongText ? (
                <button
                  className="text-toggle"
                  onClick={() =>
                    setExpandedIds((current) => {
                      const next = new Set(current);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    })
                  }
                >
                  {isExpanded ? "收起" : "展开"}
                </button>
              ) : null}

              <div className="clipboard-actions">
                <button aria-label="Copy item" onClick={() => onCopy(item.id)}>
                  <Copy size={15} />
                  复制
                </button>
                <button aria-label="Pin item" onClick={() => onPin(item.id, !item.pinned)}>
                  <Pin size={15} />
                  {item.pinned ? "取消收藏" : "收藏"}
                </button>
                <button onClick={() => startRename(item)}>{item.title ? "改名" : "命名"}</button>
                <button disabled={loadingId === item.id} onClick={() => void analyzeItem(item)}>
                  {loadingId === item.id ? "AI 拆分中" : "AI 拆分"}
                </button>
                <button aria-label="Delete item" className="danger" onClick={() => onDelete(item.id)}>
                  <Trash2 size={15} />
                  删除
                </button>
              </div>

              {errorById[item.id] ? <p className="ai-error">{errorById[item.id]}</p> : null}
              {analysis ? (
                <div className="ai-result">
                  {analysis.summary ? <p className="ai-summary">{analysis.summary}</p> : null}
                  {analysis.keywords.length > 0 ? (
                    <div className="ai-tags">
                      {analysis.keywords.map((keyword) => (
                        <button key={keyword} onClick={() => onCopyText(keyword)}>
                          {keyword}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {analysis.entities.length > 0 ? (
                    <div className="ai-entities">
                      {analysis.entities.map((entity) => (
                        <button key={`${entity.label}-${entity.value}`} onClick={() => onCopyText(entity.value)}>
                          {entity.label}：{entity.value}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {analysis.todos.length > 0 ? (
                    <div className="ai-section">
                      <strong>待办</strong>
                      {analysis.todos.map((todo) => (
                        <button key={todo} onClick={() => onCopyText(todo)}>
                          {todo}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {analysis.segments.length > 0 ? (
                    <div className="ai-section">
                      <strong>拆分片段</strong>
                      {analysis.segments.map((segment) => (
                        <button
                          aria-label={`复制拆分片段：${segment}`}
                          key={segment}
                          onClick={() => onCopyText(segment)}
                        >
                          {segment}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
        {filteredItems.length === 0 ? <p className="empty">复制文本后会显示在这里</p> : null}
      </div>
    </section>
  );
}
