import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import type { GraphStateType } from "../state.js";
import { createGigaChat } from "../lib/gigachat.js";
import { detectFlower, detectPet, getFlowerDisplayName } from "../lib/synonyms.js";
import type { Pet } from "../state.js";

const NormalizedSchema = z.object({
  flower: z.string().describe("Plant name in English slug form, e.g. rose, peony"),
  pet: z.enum(["cat", "dog"]),
  scenario: z.string().describe("Brief scenario in Russian"),
});

export async function normalizeNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const query = state.rawQuery.trim();
  let flower = detectFlower(query);
  let pet = detectPet(query);

  if (!flower || !pet) {
    try {
      const llm = createGigaChat().withStructuredOutput(NormalizedSchema);
      const parsed = await llm.invoke([
        new SystemMessage(
          "Извлеки из вопроса пользователя: цветок (slug на английском), питомца (cat или dog), краткий сценарий на русском.",
        ),
        new HumanMessage(query),
      ]);
      flower = flower ?? parsed.flower.toLowerCase().replace(/\s+/g, "_");
      pet = pet ?? parsed.pet;
      return {
        normalized: {
          flower,
          pet,
          scenario: parsed.scenario || query,
        },
      };
    } catch {
      flower = flower ?? "unknown";
      pet = pet ?? "cat";
    }
  }

  return {
    normalized: {
      flower: flower ?? "unknown",
      pet: (pet ?? "cat") as Pet,
      scenario: query,
    },
  };
}

export function formatNormalizedFlower(slug: string): string {
  if (slug === "unknown") return "неизвестное растение";
  return getFlowerDisplayName(slug);
}
