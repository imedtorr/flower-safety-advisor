import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { GraphStateType } from "../state.js";
import { createGigaChat } from "../lib/gigachat.js";
import { formatNormalizedFlower } from "./normalize.js";
import { inferRiskFromAnswer } from "../lib/answerRisk.js";

const SOURCE_LABELS: Record<string, string> = {
  local: "локальная база знаний",
  api: "внешняя база ASPCA",
  tavily: "веб-поиск",
  fallback: "общие рекомендации",
};

export async function composeAnswerNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const normalized = state.normalized;
  const flowerLabel = normalized
    ? formatNormalizedFlower(normalized.flower)
    : "растение";
  const petLabel = normalized?.pet === "dog" ? "собака" : "кошка";
  const sourceLabel = state.source ? SOURCE_LABELS[state.source] : "неизвестно";

  const systemPrompt = `Ты — доброжелательный советник по безопасности цветов для домашних питомцев.
Отвечай ТОЛЬКО на русском языке.
Используй ТОЛЬКО факты из блока FACTS — не выдумывай токсичность и симптомы.
Структура ответа:
1) Краткий вердикт (безопасно / будьте осторожны / опасно)
2) Почему (2-4 предложения)
3) Практические советы для дома
4) В конце одна строка: «Источник: ...»
Обязательный дисклеймер в конце: «Это справочная информация, не замена консультации ветеринара.»`;

  const userContent = `Вопрос пользователя: ${state.rawQuery}
Цветок: ${flowerLabel}
Питомец: ${petLabel}
Сценарий: ${normalized?.scenario ?? state.rawQuery}
Источник данных: ${sourceLabel}

FACTS:
${state.facts.join("\n")}`;

  try {
    const llm = createGigaChat();
    const resp = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userContent),
    ]);
    const answer =
      typeof resp.content === "string"
        ? resp.content
        : JSON.stringify(resp.content);

    const riskLevel = inferRiskFromAnswer(answer, state.riskLevel);

    return { answer, riskLevel };
  } catch (e) {
    console.error("composeAnswer GigaChat error:", e);
    const fallbackAnswer = `По вашему вопросу о «${flowerLabel}» и ${petLabel}:

${state.facts.join("\n\n")}

Источник: ${sourceLabel}

Это справочная информация, не замена консультации ветеринара.`;

    return { answer: fallbackAnswer, riskLevel: state.riskLevel };
  }
}
