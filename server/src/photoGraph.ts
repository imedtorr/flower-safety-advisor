import "./env.js";
import { END, START, StateGraph } from "@langchain/langgraph";
import { PhotoGraphState } from "./photoState.js";
import {
  visionIdentifyNode,
  routeAfterVision,
} from "./nodes/visionIdentify.js";
import { visionFallbackNode } from "./nodes/visionFallback.js";
import { bouquetLookupNode } from "./nodes/bouquetLookup.js";
import { composeBouquetReportNode } from "./nodes/composeBouquetReport.js";
import { getGraphInvokeConfig } from "./lib/langsmith.js";

const workflow = new StateGraph(PhotoGraphState)
  .addNode("visionIdentify", visionIdentifyNode)
  .addNode("visionFallback", visionFallbackNode)
  .addNode("bouquetLookup", bouquetLookupNode)
  .addNode("composeBouquetReport", composeBouquetReportNode)
  .addEdge(START, "visionIdentify")
  .addConditionalEdges("visionIdentify", routeAfterVision, {
    bouquetLookup: "bouquetLookup",
    visionFallback: "visionFallback",
  })
  .addEdge("bouquetLookup", "composeBouquetReport")
  .addEdge("visionFallback", "composeBouquetReport")
  .addEdge("composeBouquetReport", END);

export const photoGraph = workflow.compile();

export async function runPhotoAdvisor(
  imageBuffer: Buffer,
  mimeType: string,
  query: string,
) {
  const result = await photoGraph.invoke(
    {
      imageBuffer,
      mimeType,
      rawQuery: query,
      pet: "cat",
      detectedFlowers: [],
      visionNotes: null,
      flowerResults: [],
      facts: [],
      riskLevel: "unknown",
      source: null,
      answer: "",
      visionQuality: "empty",
      graphPath: [],
    },
    {
      ...getGraphInvokeConfig(query),
      runName: "flower-safety-photo-advisor",
      tags: ["api", "analyze-photo"],
    },
  );

  return {
    answer: result.answer,
    source: result.source ?? "fallback",
    pet: result.pet,
    riskLevel: result.riskLevel,
    detectedFlowers: result.detectedFlowers,
    flowerResults: result.flowerResults,
    facts: result.facts,
    visionNotes: result.visionNotes,
    graphPath: result.graphPath,
    visionQuality: result.visionQuality,
  };
}
