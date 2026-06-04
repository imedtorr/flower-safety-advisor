import { Annotation } from "@langchain/langgraph";

export type Pet = "cat" | "dog";
export type Source = "local" | "api" | "tavily" | "fallback";
export type RiskLevel = "safe" | "caution" | "danger" | "unknown";
export type GuardVerdict = "allow" | "injection" | "off_topic";

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
  queryType: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "general",
  }),
  queryComplexity: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 1,
  }),
  quality: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),
  retryCount: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),
  maxRetries: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 2,
  }),
  processingStage: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  graphPath: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  queryAllowed: Annotation<boolean>({
    reducer: (_, next) => next,
    default: () => true,
  }),
  guardVerdict: Annotation<GuardVerdict>({
    reducer: (_, next) => next,
    default: () => "allow",
  }),
  guardReason: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
});

export type GraphStateType = typeof GraphState.State;
