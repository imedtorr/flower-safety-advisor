import { Annotation } from "@langchain/langgraph";
import type { Pet, RiskLevel, Source } from "./state.js";
import type { DetectedFlower } from "./lib/gigachatVision.js";
import type { BouquetSource } from "./lib/flowerLookup.js";

export interface FlowerResultItem {
  slug: string;
  label: string;
  found: boolean;
  source: Source | null;
  facts: string[];
  riskLevel: RiskLevel;
  confidence: number;
}

export const PhotoGraphState = Annotation.Root({
  imageBuffer: Annotation<Buffer>,
  mimeType: Annotation<string>,
  rawQuery: Annotation<string>,
  pet: Annotation<Pet>({
    reducer: (_, next) => next,
    default: () => "cat" as Pet,
  }),
  detectedFlowers: Annotation<DetectedFlower[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  visionNotes: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  flowerResults: Annotation<FlowerResultItem[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  facts: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  riskLevel: Annotation<RiskLevel>({
    reducer: (_, next) => next,
    default: () => "unknown" as RiskLevel,
  }),
  source: Annotation<BouquetSource | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  answer: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
});

export type PhotoGraphStateType = typeof PhotoGraphState.State;
