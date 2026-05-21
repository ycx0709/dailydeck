import type { AiClipboardAnalysis } from "../../src/shared/types.js";

type DeepSeekConfig = {
  apiKey: string;
  model: string;
};

type FetchLike = (
  input: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
  }
) => Promise<{
  ok: boolean;
  status?: number;
  text?: () => Promise<string>;
  json: () => Promise<unknown>;
}>;

const endpoint = "https://api.deepseek.com/chat/completions";

const systemPrompt = [
  "你是一个剪贴板语义拆分工具。",
  "根据用户提供的剪贴板文本提取真实内容，不要照抄字段模板。",
  "只返回 JSON，不要 Markdown，不要解释。",
  "必须包含这些字段：summary, keywords, segments, todos, entities。",
  "summary 用一句中文概括文本；keywords 是关键词字符串数组；segments 是按语义拆分后方便复制的小片段字符串数组；todos 是明确待办字符串数组；entities 是对象数组，每项包含 label 和 value，提取时间、地点、人名、链接、邮箱、手机号等。",
  "没有内容时返回空字符串或空数组，但只要文本里有明确内容就必须填充。"
].join("\n");

function stripCodeFence(content: string): string {
  return content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

export async function analyzeClipboardTextWithDeepSeek(
  text: string,
  config: DeepSeekConfig,
  fetchImpl: FetchLike = fetch
): Promise<AiClipboardAnalysis> {
  if (!config.apiKey.trim()) {
    throw new Error("DeepSeek API Key is not configured.");
  }

  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      stream: false,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const detail = response.text ? await response.text() : "";
    throw new Error(`DeepSeek request failed${response.status ? ` (${response.status})` : ""}: ${detail}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek returned an empty response.");
  }

  const parsed = JSON.parse(stripCodeFence(content)) as Partial<AiClipboardAnalysis>;
  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    keywords: stringArray(parsed.keywords),
    segments: stringArray(parsed.segments),
    todos: stringArray(parsed.todos),
    entities: Array.isArray(parsed.entities)
      ? parsed.entities
          .filter(
            (entry): entry is { label: string; value: string } =>
              typeof entry === "object" &&
              entry !== null &&
              typeof (entry as { label?: unknown }).label === "string" &&
              typeof (entry as { value?: unknown }).value === "string"
          )
          .filter((entry) => entry.label.trim() && entry.value.trim())
          .map((entry) => ({ label: entry.label, value: entry.value }))
      : []
  };
}
