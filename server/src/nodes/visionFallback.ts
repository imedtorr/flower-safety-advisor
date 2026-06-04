import { appendGraphPath } from "../lib/graphPath.js";
import type { VisionQuality } from "../lib/visionValidation.js";
import type { PhotoGraphStateType } from "../photoState.js";
import type { RiskLevel } from "../state.js";

function fallbackReason(quality: VisionQuality): string {
  switch (quality) {
    case "not_flower":
      return "На изображении нет букета или живых растений (похоже на скриншот, код, документ или другое фото).";
    case "empty":
      return "На фото не удалось уверенно определить цветы.";
    case "low":
      return "Распознавание цветов выполнено с низкой уверенностью.";
    default:
      return "Не удалось обработать фото как букет.";
  }
}

function fallbackHints(quality: VisionQuality): string[] {
  const common = [
    "Загрузите снимок настоящего букета или растения крупным планом при хорошем освещении.",
    "Не используйте скриншоты, фото экрана, документы и картинки без цветов.",
    "Можно описать состав букета текстом во вкладке «Текстовый запрос».",
  ];

  if (quality === "not_flower") {
    return [
      "Сервис анализирует только фотографии цветов и букетов для проверки безопасности питомцев.",
      ...common,
    ];
  }

  return common;
}

export async function visionFallbackNode(
  state: PhotoGraphStateType,
): Promise<Partial<PhotoGraphStateType>> {
  const quality = state.visionQuality;
  const facts = [
    fallbackReason(quality),
    state.visionNotes ?? fallbackHints(quality)[0],
    ...fallbackHints(quality).slice(1),
  ];

  return appendGraphPath("visionFallback", {
    detectedFlowers: [],
    flowerResults: [],
    facts,
    riskLevel: "unknown" as RiskLevel,
    source: "fallback",
  }) as Partial<PhotoGraphStateType>;
}
