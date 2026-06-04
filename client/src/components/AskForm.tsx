const EXAMPLES = [
  "Можно ли оставить розы на столе, если кот любит жевать лепестки?",
  "Пионы в вазе на подоконнике — опасны для кошки?",
  "Герберы дома с щенком — безопасно?",
];

interface AskFormProps {
  query: string;
  loading: boolean;
  onQueryChange: (q: string) => void;
  onSubmit: () => void;
}

export function AskForm({
  query,
  loading,
  onQueryChange,
  onSubmit,
}: AskFormProps) {
  return (
    <div className="space-y-4">
      <textarea
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Только вопросы о цветах и безопасности для кошки или собаки…"
        rows={4}
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
          onClick={onSubmit}
          disabled={loading || !query.trim()}
          className="rounded-2xl bg-pastel-rose px-8 py-3 text-lg font-semibold text-pastel-plum transition hover:bg-pastel-rose-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Ищем ответ…" : "Спросить"}
        </button>
      </div>
    </div>
  );
}
