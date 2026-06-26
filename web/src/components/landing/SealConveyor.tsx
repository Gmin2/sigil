import { Swap, BrandMark } from "../icons";

/* intents stream left -> right through a central seal gate. left of the gate
 * they are exposed (red); the instant they cross they are sealed (green).
 * built as two identical synchronized tracks, one red clipped to the left half,
 * one green clipped to the right half, so a chip flips colour exactly at the seam. */

const CHIPS = [
  { hash: "0xff35…41xc", ago: "5s ago" },
  { hash: "0xd25d…e1ff", ago: "5s ago" },
  { hash: "0x9f2c…ff61", ago: "12s ago" },
  { hash: "0x2a7d…cc04", ago: "31s ago" },
  { hash: "0x77be…5512", ago: "44s ago" },
  { hash: "0x55aa…0aaf", ago: "1m ago" },
];

type Tone = "red" | "sealed";

// exposed (left) = red, sealed (right) = Sigil iris, matching the commitment colour
const SEAL_BLUE = "#5a4bff";

const TONE: Record<Tone, { text: string; fill: string; border: string }> = {
  red: { text: "#b4322f", fill: "#fdecec", border: "#f3c9c9" },
  sealed: { text: SEAL_BLUE, fill: "#f1efff", border: "#d7d1ff" },
};

export default function SealConveyor({ durationS = 26, gate = 88 }: { durationS?: number; gate?: number }) {
  return (
    <div className="relative w-full overflow-hidden pb-20">
      {/* band: split tint, neutral left / green-tinted right */}
      <div className="relative h-[260px] w-full">
        <div className="absolute inset-0 bg-surface-100" />
        <div className="absolute inset-y-0 right-0 left-1/2 bg-[#f4f2ff]" />

        {/* ruler-tick edges */}
        <RulerEdge side="left" />
        <RulerEdge side="right" />

        {/* the two synchronized tracks */}
        <Track tone="red" durationS={durationS} clip="inset(0 50% 0 0)" />
        <Track tone="sealed" durationS={durationS} clip="inset(0 0 0 50%)" />

        {/* divider line + gate, centered */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2" style={{ background: SEAL_BLUE }} />
        <div
          className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[18px] shadow-[0_8px_30px_rgba(90,75,255,0.4)]"
          style={{ width: gate, height: gate, background: SEAL_BLUE }}
        >
          <BrandMark className="h-1/2 w-1/2 text-white" />
        </div>
      </div>
    </div>
  );
}

function Track({ tone, durationS, clip }: { tone: Tone; durationS: number; clip: string }) {
  const t = TONE[tone];
  const row = [...CHIPS, ...CHIPS];
  return (
    <div className="absolute inset-0" style={{ clipPath: clip }}>
      <div
        className="conveyor-track flex h-full w-max items-center gap-10 pl-10"
        style={{ animationDuration: `${durationS}s` }}
      >
        {row.map((c, i) => (
          <Chip key={`${tone}-${i}`} hash={c.hash} ago={c.ago} t={t} />
        ))}
      </div>
    </div>
  );
}

function Chip({ hash, ago, t }: { hash: string; ago: string; t: (typeof TONE)[Tone] }) {
  return (
    <div className="relative w-[360px] shrink-0">
      {/* dotted slot frame */}
      <div className="absolute -inset-x-3 -inset-y-2 rounded-[14px] border border-dashed border-black/10" />
      <div
        className="relative flex items-center gap-4 rounded-[10px] px-5 py-4"
        style={{ background: t.fill, border: `1px solid ${t.border}` }}
      >
        <span className="shrink-0" style={{ color: t.text }}>
          <Swap className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-doto text-[22px] leading-none tracking-[1px]" style={{ color: t.text }}>
            {hash}
          </div>
          <div className="mt-1.5 font-mono text-[12px] text-faint">{ago}</div>
        </div>
        {/* hatched amount block (the hidden value) */}
        <div
          className="h-7 w-16 shrink-0 rounded-[5px]"
          style={{
            border: `1px solid ${t.border}`,
            backgroundImage: `repeating-linear-gradient(-45deg, ${t.text} 0 1.5px, transparent 1.5px 7px)`,
          }}
        />
      </div>
    </div>
  );
}

function RulerEdge({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 ${side}-0 z-10 w-[46px]`}
      style={{
        backgroundImage: "repeating-linear-gradient(to bottom, #d4d4d6 0 1px, transparent 1px 9px)",
        maskImage: `linear-gradient(to ${side === "left" ? "right" : "left"}, #000, transparent)`,
        WebkitMaskImage: `linear-gradient(to ${side === "left" ? "right" : "left"}, #000, transparent)`,
      }}
    />
  );
}
