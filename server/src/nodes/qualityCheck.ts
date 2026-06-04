import { END } from "@langchain/langgraph";
import { scoreAnswerQuality } from "../lib/answerQuality.js";
import { appendGraphPath } from "../lib/graphPath.js";
import type { GraphStateType } from "../state.js";

export async function qualityCheckNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const quality = scoreAnswerQuality(state.answer, state.queryComplexity);
  const needsRetry = quality < 5 && state.retryCount < state.maxRetries;

  return appendGraphPath("qualityCheck", {
    quality,
    processingStage: needsRetry ? "retry" : "completed",
  }) as Partial<GraphStateType>;
}

export function routeAfterQuality(
  state: GraphStateType,
): "composeAnswerRetry" | typeof END {
  return state.processingStage === "retry" ? "composeAnswerRetry" : END;
}
