import { useState } from "react";
import {
  analyzeBouquetPhoto,
  askAdvisor,
  type AskResponse,
  type PhotoAnalyzeResponse,
} from "./api/client";
import { AskForm } from "./components/AskForm";
import { BouquetResultCard } from "./components/BouquetResultCard";
import { PhotoAnalyzeForm } from "./components/PhotoAnalyzeForm";
import { ResultCard } from "./components/ResultCard";
import { SideFlowerDecor } from "./components/SideFlowerDecor";

type Mode = "text" | "photo";

const DEFAULT_PHOTO_QUERY =
  "Проверь этот букет на безопасность для кошки";

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
  const [mode, setMode] = useState<Mode>("text");
  const [query, setQuery] = useState("");
  const [photoQuery, setPhotoQuery] = useState(DEFAULT_PHOTO_QUERY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textResult, setTextResult] = useState<AskResponse | null>(null);
  const [photoResult, setPhotoResult] = useState<PhotoAnalyzeResponse | null>(
    null,
  );

  async function handleTextSubmit() {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const data = await askAdvisor(q);
      setTextResult(data);
      setPhotoResult(null);
    } catch (e) {
      setTextResult(null);
      setError(e instanceof Error ? e.message : "Не удалось получить ответ");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoSubmit(file: File) {
    const q = photoQuery.trim() || DEFAULT_PHOTO_QUERY;

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeBouquetPhoto(file, q);
      setPhotoResult(data);
      setTextResult(null);
    } catch (e) {
      setPhotoResult(null);
      setError(e instanceof Error ? e.message : "Не удалось проанализировать фото");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  const hasResult = mode === "text" ? textResult : photoResult;

  return (
    <div className="relative min-h-screen">
      <SideFlowerDecor />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10 sm:px-6">
      <div className="flex-1">
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

      <div className="mb-6 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => switchMode("text")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "text"
              ? "bg-pastel-rose text-pastel-plum"
              : "border border-pastel-chip-border bg-white/80 text-pastel-muted hover:border-pastel-rose"
          }`}
        >
          Текст
        </button>
        <button
          type="button"
          onClick={() => switchMode("photo")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "photo"
              ? "bg-pastel-rose text-pastel-plum"
              : "border border-pastel-chip-border bg-white/80 text-pastel-muted hover:border-pastel-rose"
          }`}
        >
          Фото букета
        </button>
      </div>

      <main className="space-y-6">
        {mode === "text" ? (
          <AskForm
            query={query}
            loading={loading}
            onQueryChange={setQuery}
            onSubmit={handleTextSubmit}
          />
        ) : (
          <PhotoAnalyzeForm
            query={photoQuery}
            loading={loading}
            onQueryChange={setPhotoQuery}
            onSubmit={handlePhotoSubmit}
          />
        )}

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

        {!loading && !hasResult && !error && (
          <p className="text-center text-pastel-muted">
            {mode === "text"
              ? "Задайте вопрос о букете и питомце — мы проверим локальную базу, внешние источники и при необходимости веб-поиск"
              : "Загрузите фото букета — мы распознаем цветы и проверим безопасность для питомца"}
          </p>
        )}

        {mode === "text" && textResult && !loading && (
          <ResultCard result={textResult} />
        )}
        {mode === "photo" && photoResult && !loading && (
          <BouquetResultCard result={photoResult} />
        )}
      </main>
      </div>

      <footer className="shrink-0 pt-8 text-center text-xs text-pastel-muted">
        Справочная информация, не замена консультации ветеринара. При
        подозрении на отравление обращайтесь к врачу немедленно.
      </footer>
      </div>
    </div>
  );
}
