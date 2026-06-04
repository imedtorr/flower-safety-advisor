const LABELS = {
  ok: "распознавание: уверенно",
  low: "распознавание: низкая уверенность",
  empty: "распознавание: цветы не найдены",
  not_flower: "не фото букета",
} as const;

export function VisionQualityBadge({
  quality,
}: {
  quality?: keyof typeof LABELS;
}) {
  if (!quality || quality === "ok") return null;

  const isNotFlower = quality === "not_flower";

  return (
    <span
      className={
        isNotFlower
          ? "rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-800"
          : "rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800"
      }
    >
      {LABELS[quality]}
    </span>
  );
}
