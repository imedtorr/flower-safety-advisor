type DecorItem = {
  top: string;
  left?: string;
  right?: string;
  scale: string;
  rotate: string;
  delay: string;
  duration: "twinkle" | "twinkle-slow";
  kind: "bloom" | "tulip" | "rose" | "leaf";
  color: "rose" | "leaf" | "chip";
};

const LEFT_ITEMS: DecorItem[] = [
  { top: "8%", left: "12%", scale: "1.1", rotate: "-12deg", delay: "0s", duration: "twinkle", kind: "bloom", color: "rose" },
  { top: "32%", left: "28%", scale: "0.85", rotate: "8deg", delay: "1.4s", duration: "twinkle-slow", kind: "tulip", color: "chip" },
  { top: "55%", left: "8%", scale: "1", rotate: "-6deg", delay: "2.2s", duration: "twinkle", kind: "leaf", color: "leaf" },
  { top: "72%", left: "35%", scale: "0.9", rotate: "15deg", delay: "0.8s", duration: "twinkle-slow", kind: "rose", color: "rose" },
  { top: "88%", left: "18%", scale: "0.75", rotate: "-18deg", delay: "3.1s", duration: "twinkle", kind: "bloom", color: "chip" },
];

const RIGHT_ITEMS: DecorItem[] = [
  { top: "12%", right: "15%", scale: "0.95", rotate: "14deg", delay: "1.8s", duration: "twinkle-slow", kind: "rose", color: "rose" },
  { top: "28%", right: "30%", scale: "1.05", rotate: "-10deg", delay: "0.5s", duration: "twinkle", kind: "bloom", color: "chip" },
  { top: "48%", right: "10%", scale: "0.8", rotate: "6deg", delay: "2.6s", duration: "twinkle", kind: "tulip", color: "rose" },
  { top: "65%", right: "25%", scale: "1.15", rotate: "-14deg", delay: "1.1s", duration: "twinkle-slow", kind: "leaf", color: "leaf" },
  { top: "82%", right: "12%", scale: "0.88", rotate: "20deg", delay: "3.5s", duration: "twinkle", kind: "bloom", color: "rose" },
];

const FILL: Record<DecorItem["color"], string> = {
  rose: "#E8B4C8",
  leaf: "#C5E1C8",
  chip: "#F0E6F4",
};

function BloomSvg({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <circle cx="24" cy="14" r="6" fill={fill} />
      <circle cx="14" cy="22" r="6" fill={fill} opacity="0.85" />
      <circle cx="34" cy="22" r="6" fill={fill} opacity="0.85" />
      <circle cx="18" cy="32" r="6" fill={fill} opacity="0.7" />
      <circle cx="30" cy="32" r="6" fill={fill} opacity="0.7" />
      <circle cx="24" cy="24" r="5" fill={fill} />
      <rect x="22" y="30" width="4" height="14" rx="2" fill="#A8C9AB" opacity="0.8" />
    </svg>
  );
}

function TulipSvg({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 40 56" fill="none" className="h-full w-full">
      <ellipse cx="20" cy="18" rx="10" ry="14" fill={fill} />
      <ellipse cx="12" cy="22" rx="6" ry="10" fill={fill} opacity="0.75" />
      <ellipse cx="28" cy="22" rx="6" ry="10" fill={fill} opacity="0.75" />
      <rect x="18" y="28" width="4" height="24" rx="2" fill="#A8C9AB" opacity="0.8" />
    </svg>
  );
}

function RoseSvg({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 48 52" fill="none" className="h-full w-full">
      <circle cx="24" cy="20" r="8" fill={fill} />
      <circle cx="16" cy="24" r="7" fill={fill} opacity="0.8" />
      <circle cx="32" cy="24" r="7" fill={fill} opacity="0.8" />
      <circle cx="20" cy="30" r="6" fill={fill} opacity="0.65" />
      <circle cx="28" cy="30" r="6" fill={fill} opacity="0.65" />
      <circle cx="24" cy="26" r="5" fill={fill} />
      <rect x="22" y="34" width="4" height="16" rx="2" fill="#A8C9AB" opacity="0.8" />
    </svg>
  );
}

function LeafSvg({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 32 48" fill="none" className="h-full w-full">
      <path
        d="M16 4 C8 16 6 28 16 44 C26 28 24 16 16 4 Z"
        fill={fill}
      />
      <path d="M16 12 L16 40" stroke="#A8C9AB" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function FlowerShape({ kind, fill }: { kind: DecorItem["kind"]; fill: string }) {
  switch (kind) {
    case "tulip":
      return <TulipSvg fill={fill} />;
    case "rose":
      return <RoseSvg fill={fill} />;
    case "leaf":
      return <LeafSvg fill={fill} />;
    default:
      return <BloomSvg fill={fill} />;
  }
}

function SideColumn({ items, mirror }: { items: DecorItem[]; mirror?: boolean }) {
  return (
    <div
      className={`absolute top-0 h-full w-[min(22vw,200px)] ${mirror ? "right-0" : "left-0"}`}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={`absolute h-16 w-16 sm:h-20 sm:w-20 ${
            item.duration === "twinkle-slow" ? "animate-twinkle-slow" : "animate-twinkle"
          }`}
          style={{
            top: item.top,
            left: mirror ? undefined : item.left,
            right: mirror ? item.right : undefined,
            transform: `scale(${item.scale}) rotate(${item.rotate})`,
            animationDelay: item.delay,
          }}
        >
          <FlowerShape kind={item.kind} fill={FILL[item.color]} />
        </div>
      ))}
    </div>
  );
}

export function SideFlowerDecor() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden lg:block"
      aria-hidden
    >
      <SideColumn items={LEFT_ITEMS} />
      <SideColumn items={RIGHT_ITEMS} mirror />
    </div>
  );
}
