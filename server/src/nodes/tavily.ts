import { TavilySearch } from "@langchain/tavily";
import type { GraphStateType } from "../state.js";
import { getFlowerDisplayName } from "../lib/synonyms.js";

export async function tavilyNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (!state.normalized) return { found: false };

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("TAVILY_API_KEY not set, skipping tavily");
    return { found: false };
  }

  const flowerName = getFlowerDisplayName(state.normalized.flower);
  const petRu = state.normalized.pet === "cat" ? "cat" : "dog";
  const query = `${flowerName} flower toxicity ${petRu} pet houseplant safety`;

  try {
    const search = new TavilySearch({ maxResults: 3, tavilyApiKey: apiKey });
    const results = await search.invoke({ query });

    const text =
      typeof results === "string"
        ? results
        : JSON.stringify(results);

    if (!text || text.length < 20) return { found: false };

    const facts = [
      `Источник: веб-поиск (Tavily)`,
      `Запрос: ${query}`,
      `Результаты: ${text.slice(0, 2000)}`,
    ];

    return {
      found: true,
      source: "tavily",
      facts,
      riskLevel: state.riskLevel === "unknown" ? "caution" : state.riskLevel,
    };
  } catch (e) {
    console.error("tavily error:", e);
    return { found: false };
  }
}
