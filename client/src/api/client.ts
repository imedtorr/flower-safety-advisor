export type Source = "local" | "api" | "tavily" | "fallback";
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
