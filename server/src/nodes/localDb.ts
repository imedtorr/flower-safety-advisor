import { lookupLocalFlower } from "../lib/flowerLookup.js";
import { mergeRisk } from "../lib/risk.js";
import type { GraphStateType } from "../state.js";

export async function localDbNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (!state.normalized) return { found: false };

  const result = lookupLocalFlower(
    state.normalized.flower,
    state.normalized.pet,
  );

  if (!result.found) return { found: false };

  return {
    found: true,
    source: result.source ?? "local",
    facts: result.facts,
    riskLevel: mergeRisk(state.riskLevel, result.riskLevel),
  };
}
