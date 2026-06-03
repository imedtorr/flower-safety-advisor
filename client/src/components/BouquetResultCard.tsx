import { useState } from "react";
import type { PhotoAnalyzeResponse } from "../api/client";
import { RiskBadge } from "./RiskBadge";
import { SourceBadge } from "./SourceBadge";

const PET_LABELS = { cat: "кошка", dog: "собака" } as const;

export function BouquetResultCard({ result }: { result: PhotoAnalyzeResponse }) {
  const [showPerFlower, setShowPerFlower] = useState(false);

  return (
    <article className="rounded-3xl border border-pastel-chip-border bg-white/90 p-6 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <RiskBadge level={result.riskLevel} />
        <SourceBadge source={result.source} />
        <span className="text-sm text-pastel-muted">
          Питомец: {PET_LABELS[result.pet]}
        </span>
      </div>

      {result.detectedFlowers.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {result.detectedFlowers.map((f) => (
            <span
              key={`${f.slug}-${f.labelRu}`}
              className="inline-flex items-center gap-1 rounded-full border border-pastel-chip-border bg-pastel-chip px-3 py-1 text-sm text-pastel-plum"
              title={`Уверенность: ${Math.round(f.confidence * 100)}%`}
            >
              {f.labelRu}
              {f.confidence < 0.6 && (
                <span className="text-xs text-pastel-muted">?</span>
              )}
            </span>
          ))}
        </div>
      )}

      {result.visionNotes && (
        <p className="mb-3 text-sm text-pastel-muted">{result.visionNotes}</p>
      )}

      <div className="whitespace-pre-wrap leading-relaxed text-pastel-plum">
        {result.answer}
      </div>

      {result.flowerResults.length > 0 && (
        <div className="mt-5 border-t border-pastel-chip-border pt-4">
          <button
            type="button"
            onClick={() => setShowPerFlower(!showPerFlower)}
            className="text-sm font-semibold text-pastel-muted hover:text-pastel-plum"
          >
            {showPerFlower ? "Скрыть" : "Данные по каждому цветку"}
          </button>
          {showPerFlower && (
            <ul className="mt-3 space-y-3">
              {result.flowerResults.map((fr) => (
                <li
                  key={fr.slug}
                  className="rounded-xl border border-pastel-chip-border bg-pastel-chip/40 px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2 font-semibold text-pastel-plum">
                    {fr.label}
                    <RiskBadge level={fr.riskLevel} />
                    {fr.source && <SourceBadge source={fr.source} />}
                    {!fr.found && (
                      <span className="text-xs font-normal text-pastel-muted">
                        данных мало
                      </span>
                    )}
                  </div>
                  {fr.facts.length > 0 && (
                    <p className="mt-1 text-pastel-muted">{fr.facts[0]}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
