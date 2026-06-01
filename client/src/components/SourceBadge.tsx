import type { Source } from "../api/client";

const LABELS: Record<Source, string> = {
  local: "Локальная БД",
  api: "Внешний API",
  tavily: "Веб-поиск",
  fallback: "Общие советы",
};

const STYLES: Record<Source, string> = {
  local: "bg-pastel-local-bg text-pastel-local-text",
  api: "bg-pastel-api-bg text-pastel-api-text",
  tavily: "bg-pastel-tavily-bg text-pastel-tavily-text",
  fallback: "bg-pastel-fallback-bg text-pastel-fallback-text",
};

export function SourceBadge({ source }: { source: Source }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${STYLES[source]}`}
    >
      {LABELS[source]}
    </span>
  );
}
