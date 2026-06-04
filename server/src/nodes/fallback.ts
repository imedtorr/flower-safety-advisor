import { appendGraphPath } from "../lib/graphPath.js";
import type { GraphStateType } from "../state.js";
import { formatNormalizedFlower } from "./normalize.js";

export async function fallbackNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const flower = state.normalized
    ? formatNormalizedFlower(state.normalized.flower)
    : "это растение";
  const pet =
    state.normalized?.pet === "dog" ? "собакой" : "кошкой";

  const facts = [
    `Конкретных данных о «${flower}» и ${pet} в наших источниках не найдено.`,
    "Общие рекомендации: уберите букет из зоны доступа питомца.",
    "Следите за лепестками, листьями и водой в вазе — их могут пить или переворачивать.",
    "При рвоте, вялости, слюнотечении или отказе от еды — срочно к ветеринару.",
    "Не вызывайте рвоту самостоятельно без указания врача.",
  ];

  return appendGraphPath("fallback", {
    found: true,
    source: "fallback",
    facts,
    riskLevel: "unknown",
  }) as Partial<GraphStateType>;
}
