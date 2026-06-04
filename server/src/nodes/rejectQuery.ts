import { appendGraphPath } from "../lib/graphPath.js";
import { getRejectionAnswer } from "../lib/queryGuard.js";
import type { GraphStateType } from "../state.js";

export async function rejectQueryNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const answer = getRejectionAnswer({
    verdict: state.guardVerdict === "injection" ? "injection" : "off_topic",
    reason: state.guardReason || "Запрос не принят.",
  });

  return appendGraphPath("rejectQuery", {
    answer,
    source: "fallback",
    riskLevel: "unknown",
    found: false,
    quality: 0,
    processingStage: "rejected",
    queryType: "rejected",
  }) as Partial<GraphStateType>;
}
