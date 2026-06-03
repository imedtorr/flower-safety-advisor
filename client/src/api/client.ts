export type Source = "local" | "api" | "tavily" | "fallback";
export type BouquetSource = Source | "mixed";
export type RiskLevel = "safe" | "caution" | "danger" | "unknown";
export type Pet = "cat" | "dog";

export interface NormalizedQuery {
  flower: string;
  pet: Pet;
  scenario: string;
}

export interface AskResponse {
  answer: string;
  source: Source;
  normalized: NormalizedQuery | null;
  riskLevel: RiskLevel;
  facts?: string[];
}

export interface DetectedFlower {
  slug: string;
  labelRu: string;
  confidence: number;
}

export interface FlowerResultItem {
  slug: string;
  label: string;
  found: boolean;
  source: Source | null;
  facts: string[];
  riskLevel: RiskLevel;
  confidence: number;
}

export interface PhotoAnalyzeResponse {
  answer: string;
  source: BouquetSource;
  pet: Pet;
  riskLevel: RiskLevel;
  detectedFlowers: DetectedFlower[];
  flowerResults: FlowerResultItem[];
  facts?: string[];
  visionNotes?: string | null;
}

export async function askAdvisor(query: string): Promise<AskResponse> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Ошибка сервера");
  }

  return data as AskResponse;
}

export async function analyzeBouquetPhoto(
  file: File,
  query: string,
): Promise<PhotoAnalyzeResponse> {
  const form = new FormData();
  form.append("image", file);
  form.append("query", query);

  const res = await fetch("/api/analyze-photo", {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Ошибка сервера");
  }

  return data as PhotoAnalyzeResponse;
}
