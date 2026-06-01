import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, "../../../data/flowers.json");

export interface FlowerRow {
  slug: string;
  names: string[];
  toxicity_cat: string;
  toxicity_dog: string;
  symptoms: string;
  home_tips: string;
}

let cache: FlowerRow[] | null = null;

function loadFlowers(): FlowerRow[] {
  if (!cache) {
    cache = JSON.parse(readFileSync(jsonPath, "utf-8")) as FlowerRow[];
  }
  return cache;
}

export function findFlower(slug: string): FlowerRow | undefined {
  return loadFlowers().find((f) => f.slug === slug);
}
