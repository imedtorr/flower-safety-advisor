import { useEffect, useRef, useState } from "react";

const EXAMPLES = [
  "Проверь этот букет на безопасность для кошки",
  "Щенок дома — этот букет опасен?",
  "Какие цветы в букете токсичны для собаки?",
];

interface PhotoAnalyzeFormProps {
  query: string;
  loading: boolean;
  onQueryChange: (q: string) => void;
  onSubmit: (file: File) => void;
}

export function PhotoAnalyzeForm({
  query,
  loading,
  onQueryChange,
  onSubmit,
}: PhotoAnalyzeFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    setFile(picked ?? null);
  }

  function handleSubmit() {
    if (!file || loading) return;
    onSubmit(file);
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl border border-dashed border-pastel-chip-border bg-white/60 p-6 text-center"
        onClick={() => !loading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={loading}
          onChange={handleFileChange}
        />
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Превью букета"
            className="mx-auto max-h-56 rounded-xl object-contain"
          />
        ) : (
          <div className="space-y-1 text-pastel-muted">
            <p>Нажмите, чтобы выбрать фото букета (JPEG, PNG, WebP, до 5 МБ)</p>
            <p className="text-xs">
              Только снимки живых цветов. Скриншоты, код и документы не анализируются.
            </p>
          </div>
        )}
        {file && (
          <p className="mt-2 text-sm text-pastel-plum">{file.name}</p>
        )}
      </div>

      <textarea
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Например: проверь букет для кошки..."
        rows={3}
        className="w-full resize-none rounded-2xl border border-pastel-chip-border bg-white/80 px-4 py-3 text-pastel-plum shadow-soft placeholder:text-pastel-muted focus:border-pastel-rose focus:outline-none focus:ring-2 focus:ring-pastel-rose/30"
        disabled={loading}
      />

      <div className="flex flex-col items-center gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onQueryChange(ex)}
            disabled={loading}
            className="max-w-full rounded-full border border-pastel-chip-border bg-pastel-chip px-4 py-1.5 text-center text-sm text-pastel-plum transition hover:border-pastel-rose hover:bg-pastel-blush disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !file}
          className="rounded-2xl bg-pastel-rose px-8 py-3 text-lg font-semibold text-pastel-plum transition hover:bg-pastel-rose-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Анализируем фото…" : "Проверить букет"}
        </button>
      </div>
    </div>
  );
}
