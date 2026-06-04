import { appendGraphPath } from "../lib/graphPath.js";
import type { GraphStateType } from "../state.js";

const HINT =
  "В запросе, похоже, несколько растений или букет. Для точной проверки каждого цветка используйте вкладку «Фото букета» или задайте отдельный вопрос по одному растению.";

export async function multiFlowerHintNode(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const facts = state.facts.includes(HINT)
    ? state.facts
    : [HINT, ...state.facts];

  return appendGraphPath("multiFlowerHint", { facts }) as Partial<GraphStateType>;
}
