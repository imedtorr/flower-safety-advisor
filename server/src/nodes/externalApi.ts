import {
  loadAspcaPlants,
  lookupExternalFlower,
} from "../lib/flowerLookup.js";
import { mergeRisk } from "../lib/risk.js";
import type { GraphStateType } from "../state.js";

export async function externalApiNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (!state.normalized) return { found: false };

  try {
    const plants = await loadAspcaPlants();
    const result = await lookupExternalFlower(
      state.normalized.flower,
      state.normalized.pet,
      plants,
    );

    if (!result.found) return { found: false };

    return {
      found: true,
      source: result.source ?? "api",
      facts: result.facts,
      riskLevel: mergeRisk(state.riskLevel, result.riskLevel),
    };
  } catch (e) {
    console.error("externalApi error:", e);
    return { found: false };
  }
}
