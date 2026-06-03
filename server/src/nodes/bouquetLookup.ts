import {
  aggregateBouquetSource,
  loadAspcaPlants,
  lookupExternalFlower,
  lookupLocalFlower,
  lookupTavilyBouquet,
  mergeLookupRisk,
} from "../lib/flowerLookup.js";
import { mergeRisk } from "../lib/risk.js";
import { getFlowerDisplayName } from "../lib/synonyms.js";
import type { FlowerResultItem, PhotoGraphStateType } from "../photoState.js";
import type { RiskLevel } from "../state.js";

export async function bouquetLookupNode(
  state: PhotoGraphStateType,
): Promise<Partial<PhotoGraphStateType>> {
  const { detectedFlowers, pet } = state;

  if (detectedFlowers.length === 0) {
    return {
      flowerResults: [],
      facts: [
        state.visionNotes ??
          "На фото не удалось уверенно определить цветы. Уточните состав букета текстом.",
      ],
      riskLevel: "unknown" as RiskLevel,
      source: "fallback",
    };
  }

  const localResults = await Promise.all(
    detectedFlowers.map(async (d) => {
      const slug =
        d.slug === "unknown_plant" ? d.slug : d.slug.toLowerCase().replace(/\s+/g, "_");
      const local = lookupLocalFlower(slug, pet);
      const label = local.found ? local.label : d.labelRu || getFlowerDisplayName(slug);

      return {
        slug,
        label,
        confidence: d.confidence,
        local,
      };
    }),
  );

  const aspcaPlants = await loadAspcaPlants();
  const flowerResults: FlowerResultItem[] = [];
  const allFacts: string[] = [];
  let riskLevel: RiskLevel = "unknown";

  for (const item of localResults) {
    let result = item.local;
    let source = result.source;

    if (!result.found && item.slug !== "unknown_plant") {
      const external = await lookupExternalFlower(item.slug, pet, aspcaPlants);
      if (external.found) {
        result = external;
        source = external.source;
      }
    }

    flowerResults.push({
      slug: item.slug,
      label: item.label,
      found: result.found,
      source,
      facts: result.facts,
      riskLevel: result.riskLevel,
      confidence: item.confidence,
    });

    if (result.facts.length > 0) {
      allFacts.push(`--- ${item.label} ---`, ...result.facts);
    }

    riskLevel = mergeLookupRisk(riskLevel, [result]);
  }

  const stillMissing = flowerResults.filter((f) => !f.found);
  if (stillMissing.length > 0) {
    const names = stillMissing.map((f) => f.label);
    const tavily = await lookupTavilyBouquet(names, pet);

    if (tavily.found) {
      allFacts.push(`--- Веб-поиск (нераспознанные) ---`, ...tavily.facts);
      riskLevel = mergeLookupRisk(riskLevel, [tavily]);

      for (const fr of flowerResults) {
        if (!fr.found) {
          fr.found = true;
          fr.source = "tavily";
          fr.riskLevel = mergeRisk(fr.riskLevel, tavily.riskLevel);
        }
      }
    }
  }

  const sources = flowerResults.map((f) => f.source);
  const source = aggregateBouquetSource(sources);

  if (state.visionNotes) {
    allFacts.unshift(`Заметки распознавания: ${state.visionNotes}`);
  }

  return {
    flowerResults,
    facts: allFacts,
    riskLevel,
    source,
  };
}
