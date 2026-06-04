import {
  identifyFlowersFromImage,
  uploadImage,
} from "../lib/gigachatVision.js";
import { appendGraphPath } from "../lib/graphPath.js";
import {
  assessVisionResult,
  flowersForPipeline,
} from "../lib/visionValidation.js";
import { detectPet } from "../lib/synonyms.js";
import type { PhotoGraphStateType } from "../photoState.js";
import type { Pet } from "../state.js";

export async function visionIdentifyNode(
  state: PhotoGraphStateType,
): Promise<Partial<PhotoGraphStateType>> {
  const fileId = await uploadImage(state.imageBuffer, state.mimeType);
  const vision = await identifyFlowersFromImage(fileId, state.rawQuery);

  const petFromQuery = detectPet(state.rawQuery);
  const pet: Pet = petFromQuery ?? "cat";
  const visionQuality = assessVisionResult(vision);
  const detectedFlowers = flowersForPipeline(vision.flowers, visionQuality);

  return appendGraphPath("visionIdentify", {
    detectedFlowers,
    visionNotes: vision.notes ?? null,
    pet,
    visionQuality,
  }) as Partial<PhotoGraphStateType>;
}

export function routeAfterVision(
  state: PhotoGraphStateType,
): "bouquetLookup" | "visionFallback" {
  return state.visionQuality === "ok" ? "bouquetLookup" : "visionFallback";
}
