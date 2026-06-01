import type { GraphStateType } from "../state.js";
import { getFlowerDisplayName } from "../lib/synonyms.js";
import { mergeRisk, toxicityToRisk } from "../lib/risk.js";

const ASPA_URL =
  "https://ngh14.github.io/pet-poisonous-plant/poisonousPlant.json";

interface AspcaPlant {
  name?: string;
  scientific_name?: string;
  toxic_to?: string;
  clinical_signs?: string;
}

let cache: AspcaPlant[] | null = null;

async function loadPlants(): Promise<AspcaPlant[]> {
  if (cache) return cache;
  const res = await fetch(ASPA_URL);
  if (!res.ok) throw new Error(`ASPCA JSON fetch failed: ${res.status}`);
  cache = (await res.json()) as AspcaPlant[];
  return cache;
}

function matchesFlower(plant: AspcaPlant, flowerSlug: string, displayName: string): boolean {
  const hay = `${plant.name ?? ""} ${plant.scientific_name ?? ""}`.toLowerCase();
  const terms = [flowerSlug, displayName.toLowerCase()];
  return terms.some((t) => t.length > 2 && hay.includes(t));
}

export async function externalApiNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (!state.normalized) return { found: false };

  try {
    const plants = await loadPlants();
    const displayName = getFlowerDisplayName(state.normalized.flower);
    const match = plants.find((p) =>
      matchesFlower(p, state.normalized!.flower, displayName),
    );

    if (!match) return { found: false };

    const pet = state.normalized.pet;
    const toxicTo = (match.toxic_to ?? "").toLowerCase();
    const relevant =
      toxicTo.includes("both") ||
      (pet === "cat" && toxicTo.includes("cat")) ||
      (pet === "dog" && toxicTo.includes("dog"));

    const facts = [
      `Источник: ASPCA Poisonous Plants Database`,
      `Растение: ${match.name ?? displayName}`,
      match.scientific_name ? `Научное название: ${match.scientific_name}` : "",
      `Токсично для: ${match.toxic_to ?? "уточните у ветеринара"}`,
      match.clinical_signs
        ? `Клинические признаки: ${match.clinical_signs}`
        : "",
    ].filter(Boolean);

    const risk = relevant ? "caution" : "unknown";

    return {
      found: true,
      source: "api",
      facts,
      riskLevel: mergeRisk(state.riskLevel, toxicityToRisk(risk)),
    };
  } catch (e) {
    console.error("externalApi error:", e);
    return { found: false };
  }
}
