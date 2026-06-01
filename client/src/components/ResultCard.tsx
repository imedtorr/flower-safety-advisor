import { useState } from "react";
import type { AskResponse } from "../api/client";
import { RiskBadge } from "./RiskBadge";
import { SourceBadge } from "./SourceBadge";

const PET_LABELS = { cat: "кошка", dog: "собака" } as const;

export function ResultCard({ result }: { result: AskResponse }) {
  const [showDetails, setShowDetails] = useState(false);
  const n = result.normalized;

  return (
    <article className="rounded-3xl border border-pastel-chip-border bg-white/90 p-6 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <RiskBadge level={result.riskLevel} />
        <SourceBadge source={result.source} />
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
    </article>
  );
}
