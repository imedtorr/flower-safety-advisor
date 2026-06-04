import { lookupLocalFlower } from "../lib/flowerLookup.js";
import { appendGraphPath } from "../lib/graphPath.js";
import { mergeRisk } from "../lib/risk.js";
import type { GraphStateType } from "../state.js";

export async function localDbNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (!state.normalized) {
    return appendGraphPath("localDb", { found: false }) as Partial<GraphStateType>;
  }

  const result = lookupLocalFlower(
    state.normalized.flower,
    state.normalized.pet,
  );

  if (!result.found) {
    return appendGraphPath("localDb", { found: false }) as Partial<GraphStateType>;
  }

  return appendGraphPath("localDb", {
    found: true,
    source: result.source ?? "local",
    facts: result.facts,
    riskLevel: mergeRisk(state.riskLevel, result.riskLevel),
  }) as Partial<GraphStateType>;
}
