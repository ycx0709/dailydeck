import { Copy, Pin, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { classifyClipboardText, searchClipboardItems, type ClipboardCategory } from "../../shared/clipboardTools";
import type { AiClipboardAnalysis, AppSettings, ClipboardItem } from "../../shared/types";

type Props = {
  language: AppSettings["language"];
  items: ClipboardItem[];
  onCopy: (id: string) => void;
  onCopyText: (text: string) => void;
  onAnalyze: (text: string) => Promise<AiClipboardAnalysis>;
  onRename: (id: string, title: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
  onClear: (includePinned: boolean) => void;
};

type Language = AppSettings["language"];

const categories: ClipboardCategory[] = ["all", "favorite", "link", "code", "text", "other"];

const copy: Record<
  Language,
  {
    title: string;
    clearUnpinned: string;
    clearAll: string;
    search: string;
    categoryLabels: Record<ClipboardCategory, string>;
    pinned: string;
    titleLabel: string;
    titlePlaceholder: string;
    save: string;
    cancel: string;
    collapse: string;
    expand: string;
    copy: string;
    unpin: string;
    pin: string;
    rename: string;
    name: string;
    analyzing: string;
    analyze: string;
    delete: string;
    analyzeFailed: string;
    todos: string;
    segments: string;
    copySegmentLabel: string;
    empty: string;
  }
> = {
  zh: {
    title: "剪贴板 Clipboard",
    clearUnpinned: "清空未收藏",
    clearAll: "清空全部",
    search: "搜索名称或剪贴板内容",
    categoryLabels: {
      all: "全部",
      favorite: "收藏",
      link: "链接",
      code: "代码",
      text: "文本",
      other: "其他"
    },
    pinned: "已收藏",
    titleLabel: "收藏名称",
    titlePlaceholder: "给这条内容命名",
    save: "保存",
    cancel: "取消",
    collapse: "收起",
    expand: "展开",
    copy: "复制",
    unpin: "取消收藏",
    pin: "收藏",
    rename: "改名",
    name: "命名",
    analyzing: "AI 拆分中",
    analyze: "AI 拆分",
    delete: "删除",
    analyzeFailed: "AI 拆分失败",
    todos: "待办",
    segments: "拆分片段",
    copySegmentLabel: "复制拆分片段",
    empty: "复制文本后会显示在这里"
  },
  en: {
    title: "Clipboard",
    clearUnpinned: "Clear unpinned",
    clearAll: "Clear all",
    search: "Search name or clipboard content",
    categoryLabels: {
      all: "All",
      favorite: "Saved",
      link: "Links",
      code: "Code",
      text: "Text",
      other: "Other"
    },
    pinned: "Saved",
    titleLabel: "Saved name",
    titlePlaceholder: "Name this item",
    save: "Save",
    cancel: "Cancel",
    collapse: "Collapse",
    expand: "Expand",
    copy: "Copy",
    unpin: "Unsave",
    pin: "Save",
    rename: "Rename",
    name: "Name",
    analyzing: "AI splitting",
    analyze: "AI Split",
    delete: "Delete",
    analyzeFailed: "AI split failed",
    todos: "Todos",
    segments: "Segments",
    copySegmentLabel: "Copy segment",
    empty: "Copied text will appear here"
  }
};

export function ClipboardPanel({
  language,
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
  const text = copy[language];

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
        [item.id]: error instanceof Error ? error.message : text.analyzeFailed
      }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="panel clipboard-panel">
      <div className="panel-header">
        <h2>{text.title}</h2>
        <div className="button-group">
          <button onClick={() => onClear(false)}>{text.clearUnpinned}</button>
          <button onClick={() => onClear(true)}>{text.clearAll}</button>
        </div>
      </div>

      <div className="clipboard-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} />
        <div className="category-tabs" role="tablist" aria-label={language === "zh" ? "剪贴板分组" : "Clipboard groups"}>
          {categories.map((entry) => (
            <button
              className={entry === category ? "active" : ""}
              key={entry}
              onClick={() => setCategory(entry)}
              type="button"
            >
              {text.categoryLabels[entry]}
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
                <span>{text.categoryLabels[itemCategory]}</span>
                {item.pinned ? <strong>{text.pinned}</strong> : null}
              </div>

              {isEditing ? (
                <div className="clipboard-title-editor">
                  <input
                    aria-label={text.titleLabel}
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveRename(item.id);
                      if (event.key === "Escape") setEditingId(null);
                    }}
                    placeholder={text.titlePlaceholder}
                  />
                  <button onClick={() => saveRename(item.id)}>{text.save}</button>
                  <button onClick={() => setEditingId(null)}>{text.cancel}</button>
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
                  {isExpanded ? text.collapse : text.expand}
                </button>
              ) : null}

              <div className="clipboard-actions">
                <button aria-label="Copy item" onClick={() => onCopy(item.id)}>
                  <Copy size={15} />
                  {text.copy}
                </button>
                <button aria-label="Pin item" onClick={() => onPin(item.id, !item.pinned)}>
                  <Pin size={15} />
                  {item.pinned ? text.unpin : text.pin}
                </button>
                <button onClick={() => startRename(item)}>{item.title ? text.rename : text.name}</button>
                <button disabled={loadingId === item.id} onClick={() => void analyzeItem(item)}>
                  {loadingId === item.id ? text.analyzing : text.analyze}
                </button>
                <button aria-label="Delete item" className="danger" onClick={() => onDelete(item.id)}>
                  <Trash2 size={15} />
                  {text.delete}
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
                          {entity.label}: {entity.value}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {analysis.todos.length > 0 ? (
                    <div className="ai-section">
                      <strong>{text.todos}</strong>
                      {analysis.todos.map((todo) => (
                        <button key={todo} onClick={() => onCopyText(todo)}>
                          {todo}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {analysis.segments.length > 0 ? (
                    <div className="ai-section">
                      <strong>{text.segments}</strong>
                      {analysis.segments.map((segment) => (
                        <button
                          aria-label={`${text.copySegmentLabel}: ${segment}`}
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
        {filteredItems.length === 0 ? <p className="empty">{text.empty}</p> : null}
      </div>
    </section>
  );
}
