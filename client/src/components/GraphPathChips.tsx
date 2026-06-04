const NODE_LABELS: Record<string, string> = {
  guardQuery: "проверка запроса",
  rejectQuery: "отклонение",
  analyzeQuery: "анализ запроса",
  multiFlowerHint: "подсказка (букет)",
  normalize: "нормализация",
  localDb: "локальная БД",
  externalApi: "ASPCA API",
  tavily: "веб-поиск",
  fallback: "общие советы",
  composeAnswer: "ответ GigaChat",
  composeAnswerRetry: "повтор ответа",
  qualityCheck: "проверка качества",
  visionIdentify: "распознавание",
  visionFallback: "низкая уверенность",
  bouquetLookup: "поиск по цветам",
  composeBouquetReport: "отчёт по букету",
};

function labelFor(node: string): string {
  return NODE_LABELS[node] ?? node;
}

export function GraphPathChips({ path }: { path?: string[] }) {
  if (!path?.length) return null;

  return (
    <div className="mt-4 border-t border-pastel-chip-border pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pastel-muted">
        Маршрут LangGraph
      </p>
      <div className="flex flex-wrap gap-1.5">
        {path.map((node, i) => (
          <span key={`${node}-${i}`} className="inline-flex items-center gap-1">
            <span className="rounded-full border border-pastel-chip-border bg-pastel-chip px-2.5 py-0.5 text-xs text-pastel-plum">
              {labelFor(node)}
            </span>
            {i < path.length - 1 && (
              <span className="text-xs text-pastel-muted" aria-hidden>
                →
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
