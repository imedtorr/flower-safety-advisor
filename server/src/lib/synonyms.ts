import flowersData from "../../../data/flowers.json" with { type: "json" };
import type { Pet } from "../state.js";

const PET_PATTERNS: { pet: Pet; patterns: RegExp[] }[] = [
  { pet: "cat", patterns: [/кот|кошк|котён|cat|kitten|kitty/i] },
  { pet: "dog", patterns: [/собак|пёс|пес|щенок|dog|puppy/i] },
];

export function detectPet(text: string): Pet | null {
  for (const { pet, patterns } of PET_PATTERNS) {
    if (patterns.some((p) => p.test(text))) return pet;
  }
  return null;
}

export function detectFlower(text: string): string | null {
  const lower = text.toLowerCase();
  for (const flower of flowersData) {
    if (flower.names.some((name) => lower.includes(name.toLowerCase()))) {
      return flower.slug;
    }
  }
  return null;
}

export function getFlowerDisplayName(slug: string): string {
  const flower = flowersData.find((f) => f.slug === slug);
  if (!flower) return slug;
  const ru = flower.names.find((n) => /[а-яё]/i.test(n));
  return ru ?? flower.names[0];
}
