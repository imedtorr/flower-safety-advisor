import { appendGraphPath } from "../lib/graphPath.js";
import {
  validateUserQuery,
  type GuardResult,
} from "../lib/queryGuard.js";
import type { GraphStateType } from "../state.js";

export async function guardQueryNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const guard = validateUserQuery(state.rawQuery);

  return appendGraphPath("guardQuery", {
    queryAllowed: guard.verdict === "allow",
    guardVerdict: guard.verdict,
    guardReason: guard.reason,
    queryType: guard.verdict === "allow" ? state.queryType : "rejected",
    processingStage: guard.verdict === "allow" ? "guarded" : "blocked",
  }) as Partial<GraphStateType>;
}

export function routeAfterGuard(
  state: GraphStateType,
): "analyzeQuery" | "rejectQuery" {
  return state.queryAllowed ? "analyzeQuery" : "rejectQuery";
}

export type { GuardResult };
