import type { DetectedFlower, VisionIdentifyResult } from "./gigachatVision.js";

export type VisionQuality = "ok" | "low" | "empty" | "not_flower";

const MIN_CONFIDENCE_FOR_OK = 0.65;
const MIN_MAX_CONFIDENCE = 0.7;

const NOT_FLOWER_NOTE_RE =
  /скриншот|screenshot|снимок\s+экрана|код\b|code\b|программ|экран|monitor|интерфейс|ui\b|приложен|документ|pdf|текст\s+на\s+экране|не\s+фото\s+цвет|не\s+букет|нет\s+цветов|нет\s+растен|не\s+растен|not\s+a\s+(flower|plant|bouquet)|no\s+flowers|no\s+plants/i;

const UNCERTAIN_NOTE_RE =
  /не\s+уверен|неразборчив|не\s+похож|возможно\s+не|can't\s+tell|unclear|не\s+вижу\s+цвет/i;

export function notesSuggestNotFlower(notes: string): boolean {
  return NOT_FLOWER_NOTE_RE.test(notes);
}

export function assessVisionResult(result: VisionIdentifyResult): VisionQuality {
  const notes = result.notes ?? "";

  if (result.isFlowerPhoto === false) return "not_flower";
  if (notesSuggestNotFlower(notes)) return "not_flower";

  if (result.flowers.length === 0) return "empty";

  const maxConf = Math.max(...result.flowers.map((f) => f.confidence));
  const avgConf =
    result.flowers.reduce((s, f) => s + f.confidence, 0) / result.flowers.length;

  if (maxConf < MIN_MAX_CONFIDENCE) return "low";
  if (!hasConfidentFlower(result.flowers)) return "low";

  if (UNCERTAIN_NOTE_RE.test(notes) && maxConf < 0.82) return "low";
  if (avgConf < 0.55 && maxConf < 0.78) return "low";

  if (
    result.flowers.length === 1 &&
    result.flowers[0].confidence < 0.78 &&
    UNCERTAIN_NOTE_RE.test(notes)
  ) {
    return "low";
  }

  return "ok";
}

function hasConfidentFlower(flowers: DetectedFlower[]): boolean {
  return flowers.some((f) => f.confidence >= MIN_CONFIDENCE_FOR_OK);
}

export function flowersForPipeline(
  flowers: DetectedFlower[],
  quality: VisionQuality,
): DetectedFlower[] {
  return quality === "ok" ? flowers : [];
}
