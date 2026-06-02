import "./env.js";
import { END, START, StateGraph } from "@langchain/langgraph";
import { getGraphInvokeConfig } from "./lib/langsmith.js";
import { GraphState, type GraphStateType } from "./state.js";
import { normalizeNode } from "./nodes/normalize.js";
import { localDbNode } from "./nodes/localDb.js";
import { externalApiNode } from "./nodes/externalApi.js";
import { tavilyNode } from "./nodes/tavily.js";
import { fallbackNode } from "./nodes/fallback.js";
import { composeAnswerNode } from "./nodes/composeAnswer.js";

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
  .addNode("normalize", normalizeNode)
  .addNode("localDb", localDbNode)
  .addNode("externalApi", externalApiNode)
  .addNode("tavily", tavilyNode)
  .addNode("fallback", fallbackNode)
  .addNode("composeAnswer", composeAnswerNode)
  .addEdge(START, "normalize")
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
  .addEdge("composeAnswer", END);

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
    },
    getGraphInvokeConfig(query),
  );

  return {
    answer: result.answer,
    source: result.source ?? "fallback",
    normalized: result.normalized,
    riskLevel: result.riskLevel,
    facts: result.facts,
  };
}
