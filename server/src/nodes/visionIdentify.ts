import {
  identifyFlowersFromImage,
  uploadImage,
} from "../lib/gigachatVision.js";
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

  return {
    detectedFlowers: vision.flowers,
    visionNotes: vision.notes ?? null,
    pet,
  };
}
