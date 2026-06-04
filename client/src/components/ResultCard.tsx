import { useState } from "react";
import type { AskResponse } from "../api/client";
import { GraphPathChips } from "./GraphPathChips";
import { RiskBadge } from "./RiskBadge";
import { SourceBadge } from "./SourceBadge";

const PET_LABELS = { cat: "кошка", dog: "собака" } as const;

export function ResultCard({ result }: { result: AskResponse }) {
  const [showDetails, setShowDetails] = useState(false);
  const n = result.normalized;

  return (
    <article className="rounded-3xl border border-pastel-chip-border bg-white/90 p-6 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {result.rejected && (
          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-800">
            запрос отклонён
          </span>
        )}
        <RiskBadge level={result.riskLevel} />
        {!result.rejected && <SourceBadge source={result.source} />}
        {result.retryCount != null && result.retryCount > 0 && (
          <span className="rounded-full border border-pastel-chip-border bg-pastel-chip px-2.5 py-0.5 text-xs text-pastel-muted">
            повторов ответа: {result.retryCount}
          </span>
        )}
        {result.quality != null && result.quality > 0 && (
          <span className="rounded-full border border-pastel-chip-border bg-pastel-chip px-2.5 py-0.5 text-xs text-pastel-muted">
            качество: {result.quality}/10
          </span>
        )}
      </div>

      <div className="whitespace-pre-wrap leading-relaxed text-pastel-plum">
        {result.answer}
      </div>

      {n && (
        <div className="mt-5 border-t border-pastel-chip-border pt-4">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm font-semibold text-pastel-muted hover:text-pastel-plum"
          >
            {showDetails ? "Скрыть" : "Как мы поняли вопрос"}
          </button>
          {showDetails && (
            <dl className="mt-2 space-y-1 text-sm text-pastel-muted">
              <div>
                <dt className="inline font-semibold text-pastel-plum">Цветок: </dt>
                <dd className="inline">{n.flower}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-pastel-plum">Питомец: </dt>
                <dd className="inline">{PET_LABELS[n.pet]}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-pastel-plum">Сценарий: </dt>
                <dd className="inline">{n.scenario}</dd>
              </div>
            </dl>
          )}
        </div>
      )}

      <GraphPathChips path={result.graphPath} />
    </article>
  );
}
