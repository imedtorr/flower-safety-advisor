import type { RiskLevel } from "../state.js";

export function toxicityToRisk(level: string): RiskLevel {
  const l = level.toLowerCase();
  if (l === "low" || l === "none" || l === "non-toxic" || l === "nontoxic") {
    return "safe";
  }
  if (l === "high" || l === "severe") return "danger";
  if (l === "moderate" || l === "medium") return "caution";
  return "unknown";
}

export function mergeRisk(current: RiskLevel, next: RiskLevel): RiskLevel {
  const order: RiskLevel[] = ["unknown", "safe", "caution", "danger"];
  return order.indexOf(next) > order.indexOf(current) ? next : current;
}
