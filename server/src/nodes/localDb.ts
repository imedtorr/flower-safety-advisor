import { findFlower } from "../db/client.js";
import { getFlowerDisplayName } from "../lib/synonyms.js";
import { mergeRisk, toxicityToRisk } from "../lib/risk.js";
import type { GraphStateType } from "../state.js";

export async function localDbNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (!state.normalized) return { found: false };

  const row = findFlower(state.normalized.flower);
  if (!row) return { found: false };

  const pet = state.normalized.pet;
  const toxicity = pet === "cat" ? row.toxicity_cat : row.toxicity_dog;
  const displayName = getFlowerDisplayName(row.slug);

  const facts = [
    `Растение: ${displayName} (${row.slug})`,
    `Токсичность для ${pet === "cat" ? "кошек" : "собак"}: ${toxicity}`,
    `Симптомы: ${row.symptoms}`,
    `Советы по дому: ${row.home_tips}`,
  ];

  return {
    found: true,
    source: "local",
    facts,
    riskLevel: mergeRisk(state.riskLevel, toxicityToRisk(toxicity)),
  };
}
