import { detectFlower } from "../lib/synonyms.js";
import { appendGraphPath } from "../lib/graphPath.js";
import type { GraphStateType } from "../state.js";

function isMultiFlowerQuery(query: string): boolean {
  const lower = query.toLowerCase();
  if (/букет|несколько|сравни|все цветы|перечисли|разница между/.test(lower)) {
    return true;
  }
  if (/,/.test(lower) && /\sи\s/.test(lower)) return true;

  const flowerHits = flowersDataSlugsInText(lower);
  return flowerHits >= 2;
}

function flowersDataSlugsInText(lower: string): number {
  let count = 0;
  const patterns = [
    /роз|rose/i,
    /лили|lily/i,
    /пион|peony/i,
    /тюльпан|tulip/i,
    /гербер|gerbera/i,
    /азали|azalea/i,
    /хризантем|chrysanthemum/i,
  ];
  for (const p of patterns) {
    if (p.test(lower)) count += 1;
  }
  return count;
}

export async function analyzeQueryNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const query = state.rawQuery.trim().toLowerCase();

  let complexity = 1;
  if (query.length > 120) complexity += 2;
  if (query.length > 200) complexity += 1;
  if (/сравни|анализ|подробно|разница|токсичн/.test(query)) complexity += 3;
  if (/букет|несколько/.test(query)) complexity += 2;

  const multiFlower = isMultiFlowerQuery(state.rawQuery);
  const flowerDetected = detectFlower(state.rawQuery);

  let queryType = "single";
  if (multiFlower) queryType = "multi";
  else if (!flowerDetected) queryType = "unclear";

  return appendGraphPath("analyzeQuery", {
    queryType,
    queryComplexity: Math.min(complexity, 10),
    processingStage: "analyzed",
  }) as Partial<GraphStateType>;
}

export function routeAfterAnalyze(
  state: GraphStateType,
): "multiFlowerHint" | "normalize" {
  return state.queryType === "multi" ? "multiFlowerHint" : "normalize";
}
