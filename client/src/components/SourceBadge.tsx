import type { BouquetSource } from "../api/client";

const LABELS: Record<BouquetSource, string> = {
  local: "Локальная БД",
  api: "Внешний API",
  tavily: "Веб-поиск",
  fallback: "Общие советы",
  mixed: "Смешанные источники",
};

const STYLES: Record<BouquetSource, string> = {
  local: "bg-pastel-local-bg text-pastel-local-text",
  api: "bg-pastel-api-bg text-pastel-api-text",
  tavily: "bg-pastel-tavily-bg text-pastel-tavily-text",
  fallback: "bg-pastel-fallback-bg text-pastel-fallback-text",
  mixed: "bg-pastel-chip text-pastel-plum",
};

export function SourceBadge({ source }: { source: BouquetSource }) {
  const key = source in LABELS ? source : "fallback";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${STYLES[key]}`}
    >
      {LABELS[key]}
    </span>
  );
}
