import "./env.js";
import { END, START, StateGraph } from "@langchain/langgraph";
import { getGraphInvokeConfig } from "./lib/langsmith.js";
import { GraphState, type GraphStateType } from "./state.js";
import { guardQueryNode, routeAfterGuard } from "./nodes/guardQuery.js";
import { rejectQueryNode } from "./nodes/rejectQuery.js";
import { analyzeQueryNode, routeAfterAnalyze } from "./nodes/analyzeQuery.js";
import { multiFlowerHintNode } from "./nodes/multiFlowerHint.js";
import { normalizeNode } from "./nodes/normalize.js";
import { localDbNode } from "./nodes/localDb.js";
import { externalApiNode } from "./nodes/externalApi.js";
import { tavilyNode } from "./nodes/tavily.js";
import { fallbackNode } from "./nodes/fallback.js";
import { composeAnswerNode } from "./nodes/composeAnswer.js";
import { qualityCheckNode, routeAfterQuality } from "./nodes/qualityCheck.js";
import { composeAnswerRetryNode } from "./nodes/composeAnswerRetry.js";

function routeAfterLookup(state: GraphStateType): "composeAnswer" | "externalApi" {
  return state.found ? "composeAnswer" : "externalApi";
}

function routeAfterApi(state: GraphStateType): "composeAnswer" | "tavily" {
  return state.found ? "composeAnswer" : "tavily";
}

function routeAfterTavily(state: GraphStateType): "composeAnswer" | "fallback" {
  return state.found ? "composeAnswer" : "fallback";
}

const workflow = new StateGraph(GraphState)
  .addNode("guardQuery", guardQueryNode)
  .addNode("rejectQuery", rejectQueryNode)
  .addNode("analyzeQuery", analyzeQueryNode)
  .addNode("multiFlowerHint", multiFlowerHintNode)
  .addNode("normalize", normalizeNode)
  .addNode("localDb", localDbNode)
  .addNode("externalApi", externalApiNode)
  .addNode("tavily", tavilyNode)
  .addNode("fallback", fallbackNode)
  .addNode("composeAnswer", composeAnswerNode)
  .addNode("qualityCheck", qualityCheckNode)
  .addNode("composeAnswerRetry", composeAnswerRetryNode)
  .addEdge(START, "guardQuery")
  .addConditionalEdges("guardQuery", routeAfterGuard, {
    analyzeQuery: "analyzeQuery",
    rejectQuery: "rejectQuery",
  })
  .addEdge("rejectQuery", END)
  .addConditionalEdges("analyzeQuery", routeAfterAnalyze, {
    multiFlowerHint: "multiFlowerHint",
    normalize: "normalize",
  })
  .addEdge("multiFlowerHint", "normalize")
  .addEdge("normalize", "localDb")
  .addConditionalEdges("localDb", routeAfterLookup, {
    composeAnswer: "composeAnswer",
    externalApi: "externalApi",
  })
  .addConditionalEdges("externalApi", routeAfterApi, {
    composeAnswer: "composeAnswer",
    tavily: "tavily",
  })
  .addConditionalEdges("tavily", routeAfterTavily, {
    composeAnswer: "composeAnswer",
    fallback: "fallback",
  })
  .addEdge("fallback", "composeAnswer")
  .addEdge("composeAnswer", "qualityCheck")
  .addConditionalEdges("qualityCheck", routeAfterQuality, {
    composeAnswerRetry: "composeAnswerRetry",
    [END]: END,
  })
  .addEdge("composeAnswerRetry", "qualityCheck");

export const graph = workflow.compile();

export async function runAdvisor(query: string) {
  const result = await graph.invoke(
    {
      rawQuery: query,
      normalized: null,
      source: null,
      facts: [],
      riskLevel: "unknown",
      answer: "",
      found: false,
      queryType: "general",
      queryComplexity: 1,
      quality: 0,
      retryCount: 0,
      maxRetries: 2,
      processingStage: "",
      graphPath: [],
      queryAllowed: true,
      guardVerdict: "allow",
      guardReason: "",
    },
    getGraphInvokeConfig(query),
  );

  return {
    answer: result.answer,
    source: result.source ?? "fallback",
    normalized: result.normalized,
    riskLevel: result.riskLevel,
    facts: result.facts,
    graphPath: result.graphPath,
    quality: result.quality,
    retryCount: result.retryCount,
    queryType: result.queryType,
    rejected: result.queryType === "rejected",
    guardVerdict: result.guardVerdict,
  };
}
