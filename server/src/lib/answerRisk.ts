import type { RiskLevel } from "../state.js";

export function inferRiskFromAnswer(text: string, current: RiskLevel): RiskLevel {
  const lower = text.toLowerCase();
  if (
    /опасн|срочно|не держите|не рекоменду|высок.*токсич|почечн|летальн/i.test(
      lower,
    )
  ) {
    return "danger";
  }
  if (/осторож|умерен|возможн.*рвот|следите/i.test(lower)) {
    return current === "danger" ? "danger" : "caution";
  }
  if (/безопас|низк.*риск|обычно нетоксич|малоопас/i.test(lower)) {
    return current === "unknown" ? "safe" : current;
  }
  return current;
}
