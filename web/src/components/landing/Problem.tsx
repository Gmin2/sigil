import { Eye, Swap, ArrowRight } from "../icons";

const RED = "#b4322f";
const FAINT = "#9a9a9a";

const PAINS = [
  {
    title: "Public mempools leak intent",
    body: "The moment you sign a swap, the order sits in a public mempool — token, amount, and price readable by anyone before it ever executes.",
  },
  {
    title: "Bots frontrun and sandwich",
    body: "Searchers race your trade, copy it, and slot their own orders around it. You get a worse price; they take the spread.",
  },
  {
    title: "No private intents on Bitcoin",
    body: "Stacks has no intents layer at all — no confidential way to say “fill this for me” and let agents compete without exposing the order.",
  },
];

export default function Problem() {
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto grid max-w-[1080px] gap-14 px-6 md:grid-cols-2 md:items-center">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-wide text-[#b4322f]">the problem</p>
          <h2 className="mt-3 font-sans text-[40px] font-normal leading-[1.05] tracking-[-1.6px] text-ink">
            Your order is public the moment you sign it.
          </h2>
          <p className="mt-4 max-w-[460px] font-text text-[16px] leading-[24px] text-muted">
            On-chain trading is transparent by default — and that transparency is
            exactly what gets exploited. Anyone can read your order and race it.
          </p>

          <div className="mt-10 space-y-7">
            {PAINS.map((p) => (
              <div key={p.title} className="flex gap-4">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: RED }} />
                <div>
                  <h3 className="font-sans text-[16px] font-medium tracking-[-0.2px] text-ink">{p.title}</h3>
                  <p className="mt-1 font-text text-[14px] leading-[21px] text-muted">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ProblemVisual />
      </div>
    </section>
  );
}

function ProblemVisual() {
  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] ring-1 ring-black/[0.04]"
      style={{ background: "radial-gradient(120% 120% at 50% 0%, #fff6f5 0%, #fbe8e7 100%)" }}
    >
      <svg viewBox="0 0 440 330" className="absolute inset-0 h-full w-full p-4" style={{ filter: "drop-shadow(0 5px 12px rgba(120,40,40,0.10))" }}>
        {/* watching eye */}
        <g transform="translate(150,34)" style={{ color: RED }}>
          <Eye className="h-6 w-6" />
        </g>
        <text x="182" y="52" fill={RED} style={{ fontFamily: "baseSansMono", fontSize: 11 }}>
          everyone can read it
        </text>

        {/* exposed order — every field visible */}
        <rect x="40" y="86" width="220" height="150" rx="12" fill="#fff" stroke="#f1c9c7" />
        <text x="58" y="110" fill={FAINT} style={{ fontFamily: "baseSansMono", fontSize: 11 }}>public order</text>
        <Row y={134} k="swap" v="0.05 sBTC" />
        <Row y={166} k="for" v="4,850 USDA" />
        <Row y={198} k="to" v="ST1PQ…GZGM" />

        {/* frontrun arrow to a bot */}
        <path d="M268 160 H322" stroke={RED} strokeWidth="1.5" strokeDasharray="2 4" fill="none" />
        <polygon points="322,156 330,160 322,164" fill={RED} />
        <rect x="332" y="132" width="74" height="56" rx="12" fill="#fdecec" stroke="#f1c9c7" />
        <text x="369" y="158" textAnchor="middle" fill={RED} style={{ fontFamily: "baseSans", fontSize: 14, fontWeight: 500 }}>bot</text>
        <text x="369" y="174" textAnchor="middle" fill={FAINT} style={{ fontFamily: "baseSansMono", fontSize: 10 }}>frontruns</text>

        {/* swap glyph badge bottom-left */}
        <g transform="translate(54,256)" style={{ color: RED }}>
          <Swap className="h-4 w-4" />
        </g>
        <text x="78" y="270" fill={FAINT} style={{ fontFamily: "baseSansMono", fontSize: 11 }}>
          worse price, leaked size
        </text>
        <g transform="translate(248,256)" style={{ color: RED }}>
          <ArrowRight className="h-4 w-4" />
        </g>
      </svg>
    </div>
  );
}

function Row({ y, k, v }: { y: number; k: string; v: string }) {
  return (
    <>
      <text x="58" y={y} fill={FAINT} style={{ fontFamily: "baseSansMono", fontSize: 12 }}>{k}</text>
      <text x="242" y={y} textAnchor="end" fill="#b4322f" style={{ fontFamily: "baseSans", fontSize: 14, fontWeight: 500 }}>{v}</text>
    </>
  );
}
