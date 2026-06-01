import { useState } from "react";
import { askAdvisor, type AskResponse } from "./api/client";
import { AskForm } from "./components/AskForm";
import { ResultCard } from "./components/ResultCard";

function FlowerIcon() {
  return (
    <svg
      className="h-10 w-10 text-pastel-rose"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <circle cx="24" cy="14" r="6" fill="#E8B4C8" />
      <circle cx="14" cy="22" r="6" fill="#F0E6F4" />
      <circle cx="34" cy="22" r="6" fill="#F0E6F4" />
      <circle cx="18" cy="32" r="6" fill="#C5E1C8" />
      <circle cx="30" cy="32" r="6" fill="#C5E1C8" />
      <circle cx="24" cy="24" r="5" fill="#D9A0B8" />
      <rect x="22" y="30" width="4" height="14" rx="2" fill="#A8C9AB" />
    </svg>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResponse | null>(null);

  async function handleSubmit() {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const data = await askAdvisor(q);
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Не удалось получить ответ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10 sm:px-6">
      <header className="mb-8 text-center">
        <div className="mb-3 flex justify-center gap-2">
          <FlowerIcon />
          <span className="text-3xl" aria-hidden>
            🐱
          </span>
        </div>
        <h1 className="text-3xl font-bold text-pastel-plum sm:text-4xl">
          Flower Safety Advisor
        </h1>
        <p className="mt-2 text-pastel-muted">
          Узнайте, насколько безопасны пионы, розы, герберы и другие цветы для
          вашего питомца дома
        </p>
      </header>

      <main className="space-y-6">
        <AskForm
          query={query}
          loading={loading}
          onQueryChange={setQuery}
          onSubmit={handleSubmit}
        />

        {loading && (
          <div className="flex justify-center py-8">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-pastel-chip-border border-t-pastel-rose"
              role="status"
              aria-label="Загрузка"
            />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-pastel-danger-bg bg-pastel-danger-bg/50 px-4 py-3 text-pastel-danger-text">
            {error}
          </div>
        )}

        {!loading && !result && !error && (
          <p className="text-center text-pastel-muted">
            Задайте вопрос о букете и питомце — мы проверим локальную базу,
            внешние источники и при необходимости веб-поиск
          </p>
        )}

        {result && !loading && <ResultCard result={result} />}
      </main>

      <footer className="mt-12 text-center text-xs text-pastel-muted">
        Справочная информация, не замена консультации ветеринара. При
        подозрении на отравление обращайтесь к врачу немедленно.
      </footer>
    </div>
  );
}
