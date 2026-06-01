import { Annotation } from "@langchain/langgraph";

export type Pet = "cat" | "dog";
export type Source = "local" | "api" | "tavily" | "fallback";
export type RiskLevel = "safe" | "caution" | "danger" | "unknown";

export interface NormalizedQuery {
  flower: string;
  pet: Pet;
  scenario: string;
}

export const GraphState = Annotation.Root({
  rawQuery: Annotation<string>,
  normalized: Annotation<NormalizedQuery | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  source: Annotation<Source | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  facts: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  riskLevel: Annotation<RiskLevel>({
    reducer: (_, next) => next,
    default: () => "unknown",
  }),
  answer: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  found: Annotation<boolean>({
    reducer: (_, next) => next,
    default: () => false,
  }),
});

export type GraphStateType = typeof GraphState.State;
