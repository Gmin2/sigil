/* aave-docs-style architecture schematic for Sigil — laid out on a grid so every
 * connector lands on a box edge. bitcoin (sBTC) <-> verifier <-> off-chain <-> maker. */

const CARD = "#ffffff"; // boxes stay white
const PANEL = "#cfccef"; // container behind the boxes — soft dark tone of blue
const CARD_BORDER = "#e6e3f5";
const INK = "#34305c"; // dark indigo box text
const SUB = "#6f6a92"; // box sublabels
const LABEL = "#514c70"; // column group labels (darker)
const LINE = "#bdb8df";
const ARROW = "#a39dc6";
const IRIS = "#5a4bff";

const label = { fontFamily: "baseSansMono", fontSize: 11, letterSpacing: "0.4px" } as const;
const boxText = { fontFamily: "baseSans", fontSize: 15, fontWeight: 600 } as const;
const subText = { fontFamily: "baseSansMono", fontSize: 10.5 } as const;
const pillText = { fontFamily: "baseSansMono", fontSize: 12 } as const;

// column geometry
const VERIFIER_X = 210;
const OFFCHAIN_X = 470;
const CONTAINER_W = 150;
const VR = VERIFIER_X + CONTAINER_W; // verifier right edge = 360
const OL = OFFCHAIN_X; // off-chain left edge = 470
const PILL_X = (VR + OL) / 2; // 415
const TOP = 170; // top inner-box center
const MID = 240; // vertical center
const BOT = 310; // bottom inner-box center

export default function Architecture() {
  return (
    <svg
      viewBox="0 0 760 430"
      className="h-full w-full"
      style={{ filter: "drop-shadow(0 4px 10px rgba(60,45,120,0.08))" }}
    >
      {/* group labels */}
      <GLabel x={104} t="BITCOIN" />
      <GLabel x={285} t="VERIFIER" />
      <GLabel x={545} t="OFF-CHAIN" />
      <GLabel x={695} t="MAKER" />

      {/* connectors first (under the boxes) */}
      {/* sBTC <-> verifier */}
      <Dotted x1={184} x2={VERIFIER_X} y={MID} />
      <Arrow x={VERIFIER_X} y={MID} dir="r" />
      <Arrow x={184} y={MID} dir="l" />

      {/* three rails verifier <-> off-chain */}
      <Dotted x1={VR} x2={OL} y={TOP} />
      <Arrow x={VR} y={TOP} dir="l" />
      <Dotted x1={VR} x2={OL} y={MID} />
      <Arrow x={OL} y={MID} dir="r" />
      <Dotted x1={VR} x2={OL} y={BOT} />
      <Arrow x={VR} y={BOT} dir="l" />

      {/* off-chain -> maker */}
      <Dotted x1={620} x2={659} y={MID} />
      <Arrow x={659} y={MID} dir="r" />

      {/* bitcoin box */}
      <GBox x={24} y={210} w={160} h={60} title="sBTC liquidity" />

      {/* verifier container + inner boxes */}
      <rect x={VERIFIER_X} y={92} width={CONTAINER_W} height={296} rx={18} fill={PANEL} />
      <WBox x={228} y={108} w={114} h={124} title="Escrow" />
      <WBox x={228} y={248} w={114} h={124} title="Commitment" />

      {/* off-chain container + inner boxes */}
      <rect x={OFFCHAIN_X} y={92} width={CONTAINER_W} height={296} rx={18} fill={PANEL} />
      <WBox x={488} y={108} w={114} h={124} title="Relay" sub="mempool" />
      <WBox x={488} y={248} w={114} h={124} title="Solvers" sub="auction" />

      {/* pills on the rails */}
      <Pill x={PILL_X} y={TOP} t="commit" />
      <Pill x={PILL_X} y={MID} t="release" />
      <Pill x={PILL_X} y={BOT} t="fill" />

      {/* maker wallet */}
      <circle cx={695} cy={MID} r={34} fill="#ece9fb" />
      <g transform="translate(678.2,223.2) scale(1.4)">
        <path
          d="M3 7.5A2.5 2.5 0 0 1 5.5 5H17a1 1 0 0 1 0 2H6a1 1 0 0 0 0 2h12.5A2.5 2.5 0 0 1 21 11.5v6A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z"
          fill={IRIS}
        />
        <circle cx="16.5" cy="14.5" r="1.5" fill="#ece9fb" />
      </g>
    </svg>
  );
}

function GLabel({ x, t }: { x: number; t: string }) {
  return (
    <text x={x} y={44} textAnchor="middle" fill={LABEL} style={label}>
      {t}
    </text>
  );
}

function GBox({ x, y, w, h, title }: { x: number; y: number; w: number; h: number; title: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={CARD} stroke={CARD_BORDER} />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fill={INK} style={boxText}>
        {title}
      </text>
    </g>
  );
}

function WBox({ x, y, w, h, title, sub }: { x: number; y: number; w: number; h: number; title: string; sub?: string }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={CARD} stroke={CARD_BORDER} />
      <text x={cx} y={sub ? cy : cy + 5} textAnchor="middle" fill={INK} style={boxText}>
        {title}
      </text>
      {sub && (
        <text x={cx} y={cy + 18} textAnchor="middle" fill={SUB} style={subText}>
          {sub}
        </text>
      )}
    </g>
  );
}

function Pill({ x, y, t }: { x: number; y: number; t: string }) {
  const w = t.length * 7.5 + 24;
  return (
    <g>
      <rect x={x - w / 2} y={y - 14} width={w} height={28} rx={14} fill="#fff" stroke={CARD_BORDER} />
      <text x={x} y={y + 4} textAnchor="middle" fill="#6a6580" style={pillText}>
        {t}
      </text>
    </g>
  );
}

function Dotted({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <line
      x1={x1}
      x2={x2}
      y1={y}
      y2={y}
      className="flow-dash"
      stroke={LINE}
      strokeWidth={1.5}
      strokeDasharray="1.5 5"
      strokeLinecap="round"
    />
  );
}

function Arrow({ x, y, dir }: { x: number; y: number; dir: "l" | "r" }) {
  const pts = dir === "l" ? `${x + 7},${y - 4} ${x},${y} ${x + 7},${y + 4}` : `${x - 7},${y - 4} ${x},${y} ${x - 7},${y + 4}`;
  return <polygon points={pts} fill={ARROW} />;
}
