import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import type { GraphStateType } from "../state.js";
import { createGigaChat } from "../lib/gigachat.js";
import { appendGraphPath } from "../lib/graphPath.js";
import {
  LLM_ANTI_INJECTION_RULE,
  wrapUserQueryForModel,
} from "../lib/safeUserContent.js";
import { validateUserQuery } from "../lib/queryGuard.js";
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
  if (!state.queryAllowed || validateUserQuery(query).verdict !== "allow") {
    return appendGraphPath("normalize", {
      normalized: {
        flower: "unknown",
        pet: "cat",
        scenario: query,
      },
    }) as Partial<GraphStateType>;
  }

  let flower = detectFlower(query);
  let pet = detectPet(query);

  if (!flower || !pet) {
    try {
      const llm = createGigaChat().withStructuredOutput(NormalizedSchema);
      const parsed = await llm.invoke([
        new SystemMessage(
          `Извлеки из USER_QUERY: цветок (slug на английском), питомца (cat или dog), краткий сценарий на русском.
${LLM_ANTI_INJECTION_RULE}
Если вопрос не о безопасности растений для cat/dog — flower: "unknown".`,
        ),
        new HumanMessage(wrapUserQueryForModel(query)),
      ]);
      flower = flower ?? parsed.flower.toLowerCase().replace(/\s+/g, "_");
      pet = pet ?? parsed.pet;
      return appendGraphPath("normalize", {
        normalized: {
          flower,
          pet,
          scenario: parsed.scenario || query,
        },
      }) as Partial<GraphStateType>;
    } catch {
      flower = flower ?? "unknown";
      pet = pet ?? "cat";
    }
  }

  return appendGraphPath("normalize", {
    normalized: {
      flower: flower ?? "unknown",
      pet: (pet ?? "cat") as Pet,
      scenario: query,
    },
  }) as Partial<GraphStateType>;
}

export function formatNormalizedFlower(slug: string): string {
  if (slug === "unknown") return "неизвестное растение";
  return getFlowerDisplayName(slug);
}
