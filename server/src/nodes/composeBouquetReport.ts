import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { inferRiskFromAnswer } from "../lib/answerRisk.js";
import { createGigaChat } from "../lib/gigachat.js";
import type { PhotoGraphStateType } from "../photoState.js";

const SOURCE_LABELS: Record<string, string> = {
  local: "локальная база знаний",
  api: "внешняя база ASPCA",
  tavily: "веб-поиск",
  fallback: "общие рекомендации",
  mixed: "смешанные источники",
};

export async function composeBouquetReportNode(
  state: PhotoGraphStateType,
): Promise<Partial<PhotoGraphStateType>> {
  const petLabel = state.pet === "dog" ? "собака" : "кошка";
  const sourceLabel = state.source
    ? (SOURCE_LABELS[state.source] ?? state.source)
    : "неизвестно";

  const flowerList = state.detectedFlowers
    .map(
      (f) =>
        `${f.labelRu} (${f.slug}, уверенность ${Math.round(f.confidence * 100)}%)`,
    )
    .join("; ");

  const systemPrompt = `Ты — доброжелательный советник по безопасности цветов для домашних питомцев.
Отвечай ТОЛЬКО на русском языке.
Используй ТОЛЬКО факты из блока FACTS — не выдумывай токсичность и симптомы.
Это отчёт по БУКЕТУ с фото. Структура:
1) Краткий общий вердикт (безопасно / будьте осторожны / опасно) — учитывай САМЫЙ опасный цветок
2) По каждому распознанному цветку — 1-2 предложения
3) Практические советы для дома с букетом
4) Строка: «Источник: ...»
Обязательный дисклеймер: «Это справочная информация, не замена консультации ветеринара.»
Если распознавание могло ошибиться — упомяни, что список цветов стоит проверить.`;

  const userContent = `Запрос пользователя: ${state.rawQuery}
Питомец: ${petLabel}
Распознанные на фото цветы: ${flowerList || "не определены"}
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
    console.error("composeBouquetReport GigaChat error:", e);
    const fallbackAnswer = `Отчёт по букету для ${petLabel}:

${state.facts.join("\n\n")}

Источник: ${sourceLabel}

Это справочная информация, не замена консультации ветеринара.`;

    return { answer: fallbackAnswer, riskLevel: state.riskLevel };
  }
}
