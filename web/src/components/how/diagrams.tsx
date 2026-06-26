import type { ReactNode, RefObject } from "react";
import { motion } from "motion/react";
import { FigureFrame } from "./StepFigure";
import { useStaged } from "./useStaged";

export type DiagramProps = { speed?: number; replayKey?: number; tone?: string };

const IRIS = "#5a4bff";
const SOFT = "#c3bdff";
const INK = "#171717";
const MUTE = "#6f6f6f";
const FAINT = "#9a9a9a";
const LINE = "#e5e5e5";
const FIELD = "#e8e8ee";
const GREEN = "#15875a";

const mono = { fontFamily: "baseSansMono", fontSize: 11 } as const;
const doto = (size: number) => ({ fontFamily: "doto", fontSize: size }) as const;

// shared figure: tinted panel + soft-shadowed illustration (aave-docs style)
function Figure({
  stageRef,
  tone,
  children,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  tone?: string;
  children: ReactNode;
}) {
  return (
    <div ref={stageRef}>
      <FigureFrame tone={tone}>
        <svg
          viewBox="0 0 440 320"
          className="absolute inset-0 h-full w-full p-4"
          style={{ filter: "drop-shadow(0 5px 12px rgba(50,40,90,0.09))" }}
        >
          <defs>
            <pattern id="hx" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width="7" height="7" fill="#f1efff" />
              <line x1="0" y1="0" x2="0" y2="7" stroke={IRIS} strokeWidth="1.4" />
            </pattern>
          </defs>
          {children}
        </svg>
      </FigureFrame>
    </div>
  );
}

/* ── 1. Commit & escrow — order seals into a sha256 commitment, lock closes ── */
export function CommitDiagram({ speed, replayKey, tone }: DiagramProps) {
  const { ref, stage } = useStaged([700, 1500], 3200, { speed, replayKey });
  return (
    <Figure stageRef={ref} tone={tone}>
          {/* order card */}
          <rect x="28" y="84" width="150" height="120" rx="12" fill="#fff" stroke={LINE} />
          <text x="44" y="106" fill={FAINT} style={mono}>order</text>
          <motion.g animate={{ opacity: stage >= 1 ? 0 : 1 }} transition={{ duration: 0.4 }}>
            <rect x="44" y="118" width="118" height="12" rx="3" fill={FIELD} />
            <rect x="44" y="140" width="92" height="12" rx="3" fill={FIELD} />
            <rect x="44" y="162" width="104" height="12" rx="3" fill={FIELD} />
          </motion.g>
          <motion.g animate={{ opacity: stage >= 1 ? 1 : 0 }} transition={{ duration: 0.4 }}>
            <rect x="44" y="118" width="118" height="12" rx="3" fill="url(#hx)" />
            <rect x="44" y="140" width="92" height="12" rx="3" fill="url(#hx)" />
            <rect x="44" y="162" width="104" height="12" rx="3" fill="url(#hx)" />
          </motion.g>

          {/* arrow to sha node */}
          <motion.path
            d="M178 144 H232"
            stroke={SOFT}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: stage >= 1 ? 1 : 0 }}
            transition={{ duration: 0.45 }}
          />
          <motion.path
            d="M226 139 l7 5 -7 5"
            stroke={SOFT}
            strokeWidth="2"
            fill="none"
            animate={{ opacity: stage >= 1 ? 1 : 0 }}
          />
          <circle cx="270" cy="144" r="32" fill="#fff" stroke={LINE} />
          <text x="270" y="148" textAnchor="middle" fill={IRIS} style={mono}>sha256</text>

          {/* commitment output */}
          <motion.path
            d="M302 144 H352"
            stroke={SOFT}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: stage >= 2 ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.text
            x="360"
            y="140"
            fill={IRIS}
            style={doto(15)}
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 2 ? 1 : 0 }}
          >
            0x9f2c
          </motion.text>
          <motion.text
            x="360"
            y="158"
            fill={IRIS}
            style={doto(15)}
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 2 ? 1 : 0 }}
            transition={{ delay: 0.1 }}
          >
            …ff61
          </motion.text>

          {/* escrow lock closing */}
          <g transform="translate(196,232)">
            <rect x="0" y="14" width="48" height="34" rx="6" fill={IRIS} />
            <motion.path
              d="M9 14 V8 a15 15 0 0 1 30 0 V14"
              stroke={IRIS}
              strokeWidth="5"
              fill="none"
              initial={{ y: -6, opacity: 0.4 }}
              animate={{ y: stage >= 2 ? 0 : -6, opacity: stage >= 2 ? 1 : 0.4 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            />
            <circle cx="24" cy="30" r="4" fill="#fff" />
          </g>
          <text x="220" y="296" textAnchor="middle" fill={MUTE} style={mono}>escrowed</text>
        </Figure>
  );
}

/* ── 2. Solver auction — sealed bids reveal, best wins ── */
export function AuctionDiagram({ speed, replayKey, tone }: DiagramProps) {
  const { ref, stage } = useStaged([900, 1700, 2400], 4000, { speed, replayKey });
  const bids = [
    { name: "solver-a", price: "4,902", y: 70 },
    { name: "solver-b", price: "4,947", y: 138, best: true },
    { name: "solver-c", price: "4,880", y: 206 },
  ];
  return (
    <Figure stageRef={ref} tone={tone}>
          {bids.map((b) => {
            const won = b.best && stage >= 3;
            return (
              <g key={b.name}>
                <motion.rect
                  x="70"
                  y={b.y}
                  width="300"
                  height="48"
                  rx="10"
                  fill="#fff"
                  animate={{ stroke: won ? IRIS : LINE, strokeWidth: won ? 2 : 1 }}
                />
                <text x="90" y={b.y + 29} fill={MUTE} style={mono}>{b.name}</text>

                {/* sealed lock (stage 0-1) */}
                <motion.g animate={{ opacity: stage >= 2 ? 0 : 1 }} transition={{ duration: 0.3 }}>
                  <rect x="300" y={b.y + 14} width="30" height="20" rx="4" fill={SOFT} />
                  <path d={`M308 ${b.y + 14} v-4 a7 7 0 0 1 14 0 v4`} stroke={SOFT} strokeWidth="3" fill="none" />
                </motion.g>
                {/* revealed price (stage 2+) */}
                <motion.text
                  x="345"
                  y={b.y + 30}
                  textAnchor="end"
                  fill={won ? IRIS : INK}
                  style={{ fontFamily: "baseSans", fontSize: 16, fontWeight: 500 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: stage >= 2 ? 1 : 0 }}
                >
                  {b.price}
                </motion.text>

                {/* winner check */}
                {b.best && (
                  <motion.path
                    d="M48 138 l7 8 12 -16"
                    stroke={IRIS}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: won ? 1 : 0, opacity: won ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </g>
            );
          })}
          <motion.text
            x="220"
            y="292"
            textAnchor="middle"
            fill={MUTE}
            style={mono}
            animate={{ opacity: stage >= 1 ? 1 : 0.3 }}
          >
            {stage >= 2 ? "best fill wins" : "bidding window open…"}
          </motion.text>
        </Figure>
  );
}

/* ── 3. Sealed reveal — order encrypted to the winning solver only ── */
export function RevealDiagram({ speed, replayKey, tone }: DiagramProps) {
  const { ref, stage } = useStaged([700, 1500, 2200], 3600, { speed, replayKey });
  const solvers = [
    { y: 70, win: true },
    { y: 140, win: false },
    { y: 210, win: false },
  ];
  return (
    <Figure stageRef={ref} tone={tone}>
          {/* maker */}
          <circle cx="60" cy="160" r="26" fill="#fff" stroke={LINE} />
          <text x="60" y="164" textAnchor="middle" fill={MUTE} style={mono}>maker</text>

          {/* envelope travelling left -> winning solver */}
          <motion.g
            initial={{ x: 0, y: 0 }}
            animate={{ x: stage >= 2 ? 250 : 0, y: stage >= 2 ? -90 : 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
            <rect x="98" y="146" width="40" height="28" rx="4" fill="#fff" stroke={IRIS} strokeWidth="2" />
            {/* sealed flap */}
            <motion.path
              d="M98 148 l20 14 20 -14"
              stroke={IRIS}
              strokeWidth="2"
              fill="none"
              animate={{ opacity: stage >= 1 && stage < 3 ? 1 : 0 }}
            />
            {/* key (encrypting) */}
            <motion.circle cx="118" cy="138" r="5" fill={IRIS} animate={{ opacity: stage === 1 ? 1 : 0 }} />
          </motion.g>

          {/* three solvers on the right */}
          {solvers.map((s, i) => (
            <g key={i}>
              <motion.circle
                cx="370"
                cy={s.y}
                r="24"
                fill="#fff"
                animate={{
                  stroke: s.win && stage >= 2 ? IRIS : LINE,
                  strokeWidth: s.win && stage >= 2 ? 2 : 1,
                  opacity: s.win ? 1 : stage >= 2 ? 0.4 : 1,
                }}
              />
              <text x="370" y={s.y + 4} textAnchor="middle" fill={MUTE} style={{ ...mono, fontSize: 10 }}>
                {s.win ? "winner" : "solver"}
              </text>
              {/* only winner can open it */}
              {s.win && (
                <motion.path
                  d="M358 138 l8 9 14 -18"
                  stroke={IRIS}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform={`translate(0 ${s.y - 160})`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: stage >= 3 ? 1 : 0, opacity: stage >= 3 ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </g>
          ))}

          <motion.text
            x="220"
            y="296"
            textAnchor="middle"
            fill={MUTE}
            style={mono}
            animate={{ opacity: stage >= 1 ? 1 : 0.3 }}
          >
            {stage >= 1 ? "sealed to winner (ECIES)" : "reveal"}
          </motion.text>
        </Figure>
  );
}

/* ── 4. Verify & settle — recomputed hash matches commitment, escrow releases ── */
export function SettleDiagram({ speed, replayKey, tone }: DiagramProps) {
  const { ref, stage } = useStaged([800, 1500, 2300], 4000, { speed, replayKey });
  const ok = stage >= 2;
  return (
    <Figure stageRef={ref} tone={tone}>
          {/* commitment (top) and recomputed hash (bottom) */}
          <text x="120" y="72" textAnchor="middle" fill={FAINT} style={mono}>commitment</text>
          <rect x="40" y="82" width="160" height="34" rx="8" fill="#fff" stroke={LINE} />
          <text x="120" y="104" textAnchor="middle" fill={IRIS} style={doto(14)}>0x9f2c…ff61</text>

          <text x="120" y="158" textAnchor="middle" fill={FAINT} style={mono}>sha256(reveal)</text>
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: stage >= 1 ? 1 : 0 }} transition={{ duration: 0.4 }}>
            <rect x="40" y="168" width="160" height="34" rx="8" fill="#fff" stroke={LINE} />
            <text x="120" y="190" textAnchor="middle" fill={IRIS} style={doto(14)}>0x9f2c…ff61</text>
          </motion.g>

          {/* equality check */}
          <motion.circle cx="250" cy="142" r="26" fill={ok ? GREEN : "#fff"} stroke={ok ? GREEN : LINE} animate={{}} />
          <motion.text
            x="250"
            y="148"
            textAnchor="middle"
            style={{ fontFamily: "baseSans", fontSize: 20, fontWeight: 600 }}
            animate={{ fill: ok ? "#fff" : FAINT }}
          >
            {ok ? "=" : "?"}
          </motion.text>
          <motion.path d="M68 116 Q40 142 68 168" stroke={LINE} strokeWidth="1.5" fill="none" />

          {/* escrow lock opening + payout (stage 3) */}
          <g transform="translate(300,108)">
            <rect x="0" y="20" width="44" height="32" rx="6" fill={ok ? GREEN : SOFT} />
            <motion.path
              d="M8 20 V14 a14 14 0 0 1 28 0 V20"
              stroke={ok ? GREEN : SOFT}
              strokeWidth="5"
              fill="none"
              animate={{ rotate: stage >= 3 ? -28 : 0 }}
              style={{ originX: "8px", originY: "20px" }}
            />
          </g>
          <text x="322" y="180" textAnchor="middle" fill={MUTE} style={mono}>released</text>

          {/* payout arrows */}
          <motion.path
            d="M348 130 H410"
            stroke={GREEN}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: stage >= 3 ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.text x="412" y="120" textAnchor="end" fill={MUTE} style={{ ...mono, fontSize: 10 }} animate={{ opacity: stage >= 3 ? 1 : 0 }}>
            sBTC → solver
          </motion.text>
        </Figure>
  );
}
