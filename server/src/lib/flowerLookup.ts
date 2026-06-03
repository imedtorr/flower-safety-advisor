import { findFlower } from "../db/client.js";
import { getFlowerDisplayName } from "./synonyms.js";
import { mergeRisk, toxicityToRisk } from "./risk.js";
import type { Pet, RiskLevel, Source } from "../state.js";

export interface FlowerLookupResult {
  found: boolean;
  source: Source | null;
  facts: string[];
  riskLevel: RiskLevel;
  label: string;
}

const ASPA_URL =
  "https://ngh14.github.io/pet-poisonous-plant/poisonousPlant.json";

interface AspcaPlant {
  name?: string;
  scientific_name?: string;
  toxic_to?: string;
  clinical_signs?: string;
}

let aspcaCache: AspcaPlant[] | null = null;

export async function loadAspcaPlants(): Promise<AspcaPlant[]> {
  if (aspcaCache) return aspcaCache;
  const res = await fetch(ASPA_URL);
  if (!res.ok) throw new Error(`ASPCA JSON fetch failed: ${res.status}`);
  aspcaCache = (await res.json()) as AspcaPlant[];
  return aspcaCache;
}

function matchesFlower(
  plant: AspcaPlant,
  flowerSlug: string,
  displayName: string,
): boolean {
  const hay = `${plant.name ?? ""} ${plant.scientific_name ?? ""}`.toLowerCase();
  const terms = [flowerSlug, displayName.toLowerCase()];
  return terms.some((t) => t.length > 2 && hay.includes(t));
}

export function lookupLocalFlower(slug: string, pet: Pet): FlowerLookupResult {
  const label = getFlowerDisplayName(slug);
  const row = findFlower(slug);

  if (!row) {
    return {
      found: false,
      source: null,
      facts: [],
      riskLevel: "unknown",
      label,
    };
  }

  const toxicity = pet === "cat" ? row.toxicity_cat : row.toxicity_dog;
  const facts = [
    `Растение: ${label} (${row.slug})`,
    `Токсичность для ${pet === "cat" ? "кошек" : "собак"}: ${toxicity}`,
    `Симптомы: ${row.symptoms}`,
    `Советы по дому: ${row.home_tips}`,
  ];

  return {
    found: true,
    source: "local",
    facts,
    riskLevel: toxicityToRisk(toxicity),
    label,
  };
}

export async function lookupExternalFlower(
  slug: string,
  pet: Pet,
  plants?: AspcaPlant[],
): Promise<FlowerLookupResult> {
  const label = getFlowerDisplayName(slug);

  try {
    const list = plants ?? (await loadAspcaPlants());
    const displayName = label;
    const match = list.find((p) => matchesFlower(p, slug, displayName));

    if (!match) {
      return {
        found: false,
        source: null,
        facts: [],
        riskLevel: "unknown",
        label,
      };
    }

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
      riskLevel: toxicityToRisk(risk),
      label,
    };
  } catch (e) {
    console.error("lookupExternalFlower error:", e);
    return {
      found: false,
      source: null,
      facts: [],
      riskLevel: "unknown",
      label,
    };
  }
}

export async function lookupTavilyBouquet(
  flowerNames: string[],
  pet: Pet,
): Promise<FlowerLookupResult> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || flowerNames.length === 0) {
    return {
      found: false,
      source: null,
      facts: [],
      riskLevel: "unknown",
      label: flowerNames.join(", "),
    };
  }

  const petEn = pet === "cat" ? "cat" : "dog";
  const query = `${flowerNames.join(" ")} bouquet flower toxicity ${petEn} pet safety`;

  try {
    const { TavilySearch } = await import("@langchain/tavily");
    const search = new TavilySearch({ maxResults: 3, tavilyApiKey: apiKey });
    const results = await search.invoke({ query });

    const text =
      typeof results === "string" ? results : JSON.stringify(results);

    if (!text || text.length < 20) {
      return {
        found: false,
        source: null,
        facts: [],
        riskLevel: "unknown",
        label: flowerNames.join(", "),
      };
    }

    const facts = [
      `Источник: веб-поиск (Tavily)`,
      `Запрос: ${query}`,
      `Результаты: ${text.slice(0, 2000)}`,
    ];

    return {
      found: true,
      source: "tavily",
      facts,
      riskLevel: "caution",
      label: flowerNames.join(", "),
    };
  } catch (e) {
    console.error("lookupTavilyBouquet error:", e);
    return {
      found: false,
      source: null,
      facts: [],
      riskLevel: "unknown",
      label: flowerNames.join(", "),
    };
  }
}

export function mergeLookupRisk(
  current: RiskLevel,
  results: FlowerLookupResult[],
): RiskLevel {
  return results.reduce(
    (acc, r) => mergeRisk(acc, r.riskLevel),
    current,
  );
}

export type BouquetSource = Source | "mixed";

export function aggregateBouquetSource(
  sources: (Source | null)[],
): BouquetSource {
  const found = sources.filter((s): s is Source => s !== null);
  if (found.length === 0) return "fallback";
  const unique = new Set(found);
  if (unique.size === 1) return [...unique][0]!;
  return "mixed";
}
