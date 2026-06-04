import {
  loadAspcaPlants,
  lookupExternalFlower,
} from "../lib/flowerLookup.js";
import { appendGraphPath } from "../lib/graphPath.js";
import { mergeRisk } from "../lib/risk.js";
import type { GraphStateType } from "../state.js";

export async function externalApiNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (!state.normalized) {
    return appendGraphPath("externalApi", { found: false }) as Partial<GraphStateType>;
  }

  try {
    const plants = await loadAspcaPlants();
    const result = await lookupExternalFlower(
      state.normalized.flower,
      state.normalized.pet,
      plants,
    );

    if (!result.found) {
      return appendGraphPath("externalApi", { found: false }) as Partial<GraphStateType>;
    }

    return appendGraphPath("externalApi", {
      found: true,
      source: result.source ?? "api",
      facts: result.facts,
      riskLevel: mergeRisk(state.riskLevel, result.riskLevel),
    }) as Partial<GraphStateType>;
  } catch (e) {
    console.error("externalApi error:", e);
    return appendGraphPath("externalApi", { found: false }) as Partial<GraphStateType>;
  }
}
