import { createGigaChat } from "../lib/gigachat.js";
import {
  buildComposeFallbackAnswer,
  buildComposeMessages,
} from "../lib/composeMessages.js";
import { appendGraphPath } from "../lib/graphPath.js";
import { inferRiskFromAnswer } from "../lib/answerRisk.js";
import type { GraphStateType } from "../state.js";

export async function composeAnswerRetryNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  try {
    const llm = createGigaChat();
    const resp = await llm.invoke(buildComposeMessages(state, true));
    const answer =
      typeof resp.content === "string"
        ? resp.content
        : JSON.stringify(resp.content);

    const riskLevel = inferRiskFromAnswer(answer, state.riskLevel);

    return appendGraphPath("composeAnswerRetry", {
      answer,
      riskLevel,
      retryCount: state.retryCount + 1,
      processingStage: "composed",
    }) as Partial<GraphStateType>;
  } catch (e) {
    console.error("composeAnswerRetry GigaChat error:", e);
    return appendGraphPath("composeAnswerRetry", {
      answer: buildComposeFallbackAnswer(state),
      riskLevel: state.riskLevel,
      retryCount: state.retryCount + 1,
      processingStage: "composed",
    }) as Partial<GraphStateType>;
  }
}
