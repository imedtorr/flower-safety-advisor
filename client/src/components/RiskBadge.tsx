import type { RiskLevel } from "../api/client";

const LABELS: Record<RiskLevel, string> = {
  safe: "Безопасно",
  caution: "Осторожно",
  danger: "Опасно",
  unknown: "Неизвестно",
};

const STYLES: Record<RiskLevel, string> = {
  safe: "bg-pastel-safe-bg text-pastel-safe-text",
  caution: "bg-pastel-caution-bg text-pastel-caution-text",
  danger: "bg-pastel-danger-bg text-pastel-danger-text",
  unknown: "bg-pastel-unknown-bg text-pastel-unknown-text",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${STYLES[level]}`}
    >
      {LABELS[level]}
    </span>
  );
}
