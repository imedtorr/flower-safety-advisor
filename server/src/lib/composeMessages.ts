import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { GraphStateType } from "../state.js";
import { formatNormalizedFlower } from "../nodes/normalize.js";
import {
  LLM_ANTI_INJECTION_RULE,
  wrapUserQueryForModel,
} from "./safeUserContent.js";

const SOURCE_LABELS: Record<string, string> = {
  local: "локальная база знаний",
  api: "внешняя база ASPCA",
  tavily: "веб-поиск",
  fallback: "общие рекомендации",
};

function buildSystemPrompt(strict: boolean): string {
  const base = `Ты — доброжелательный советник по безопасности цветов для домашних питомцев.
Отвечай ТОЛЬКО на русском языке.
${LLM_ANTI_INJECTION_RULE}
Используй ТОЛЬКО факты из блока FACTS — не выдумывай токсичность и симптомы.
Структура ответа:
1) Краткий вердикт (безопасно / будьте осторожны / опасно)
2) Почему (2-4 предложения)
3) Практические советы для дома
4) В конце одна строка: «Источник: ...»
Обязательный дисклеймер в конце: «Это справочная информация, не замена консультации ветеринара.»`;

  if (!strict) return base;

  return `${base}

ВАЖНО: предыдущий ответ был слишком коротким или неполным. Обязательно заполни все 4 блока.
Не сокращай FACTS — включи все релевантные факты в раздел «Почему».
Минимум 6 предложений в основной части ответа.`;
}

export function buildComposeMessages(state: GraphStateType, strict = false) {
  const normalized = state.normalized;
  const flowerLabel = normalized
    ? formatNormalizedFlower(normalized.flower)
    : "растение";
  const petLabel = normalized?.pet === "dog" ? "собака" : "кошка";
  const sourceLabel = state.source ? SOURCE_LABELS[state.source] : "неизвестно";

  const userContent = `${wrapUserQueryForModel(state.rawQuery)}

Цветок: ${flowerLabel}
Питомец: ${petLabel}
Сценарий: ${normalized?.scenario ?? state.rawQuery}
Источник данных: ${sourceLabel}

FACTS:
${state.facts.join("\n")}`;

  return [
    new SystemMessage(buildSystemPrompt(strict)),
    new HumanMessage(userContent),
  ];
}

export function buildComposeFallbackAnswer(state: GraphStateType): string {
  const normalized = state.normalized;
  const flowerLabel = normalized
    ? formatNormalizedFlower(normalized.flower)
    : "растение";
  const petLabel = normalized?.pet === "dog" ? "собака" : "кошка";
  const sourceLabel = state.source ? SOURCE_LABELS[state.source] : "неизвестно";

  return `По вашему вопросу о «${flowerLabel}» и ${petLabel}:

${state.facts.join("\n\n")}

Источник: ${sourceLabel}

Это справочная информация, не замена консультации ветеринара.`;
}
