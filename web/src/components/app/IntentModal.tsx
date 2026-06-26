/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Intent detail modal
 *
 * Read top-to-bottom. Each ms value is after the modal mounts.
 *
 *    0ms   backdrop blurs in, card springs up (scale 0.94 → 1)
 *  120ms   brand panel logo + wordmark fade/scale in
 *  320ms   settlement summary (sBTC → USDA) slides up
 *  460ms   sealed commitment card slides up
 *  600ms   maker + tx rows stagger up (60ms apart)
 * ───────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AnimatedLogo } from "../AnimatedLogo";
import { SbtcLogo, UsdaLogo } from "../tokens";
import { Lock, ArrowRight } from "../icons";
import { fmtAmount, shorten } from "../../lib/format";
import { txUrl } from "../../lib/config";
import type { FeedIntent } from "../../lib/relay";

const SBTC_DEC = 8;
const USDA_DEC = 6;

const TIMING = {
  brand: 120, // brand panel content appears
  summary: 320, // settlement summary slides up
  commit: 460, // sealed commitment card
  rows: 600, // detail + tx rows stagger
};

const CARD = { spring: { type: "spring" as const, stiffness: 320, damping: 26 } };
const BRAND = { spring: { type: "spring" as const, stiffness: 260, damping: 22 } };
const LIFT = { offsetY: 12, spring: { type: "spring" as const, stiffness: 340, damping: 28 } };
const ROWS = { stagger: 0.06, offsetY: 10, spring: { type: "spring" as const, stiffness: 360, damping: 30 } };

export default function IntentModal({ intent, onClose }: { intent: FeedIntent; onClose: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setStage(1), TIMING.brand),
      setTimeout(() => setStage(2), TIMING.summary),
      setTimeout(() => setStage(3), TIMING.commit),
      setTimeout(() => setStage(4), TIMING.rows),
    ];
    return () => t.forEach(clearTimeout);
  }, [intent.id]);

  const fill = intent.auction?.amountOut;
  const amountIn = fmtAmount(intent.amountIn, SBTC_DEC);
  const filledFor = fill ? fmtAmount(fill, USDA_DEC) : null;

  const txRows = [
    intent.createTxid && { label: "Escrow tx", txid: intent.createTxid },
    intent.fillTxid && { label: "Fill tx", txid: intent.fillTxid },
  ].filter(Boolean) as { label: string; txid: string }[];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="flex w-full max-w-[600px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:flex-row"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={CARD.spring}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── brand panel ───────────────────────── */}
        <div className="relative flex shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-accent to-accent-600 p-6 text-white sm:w-[210px]">
          {/* faint seal watermark */}
          <Lock className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-white/10" />

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: stage >= 1 ? 1 : 0, scale: stage >= 1 ? 1 : 0.8 }}
            transition={BRAND.spring}
          >
            <AnimatedLogo className="h-14 w-14 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : 8 }}
            transition={{ ...BRAND.spring, delay: 0.08 }}
            className="relative mt-6"
          >
            <div className="font-sans text-[22px] font-medium tracking-[-0.6px]">Sigil</div>
            <div className="mt-1 font-mono text-[11px] leading-[1.5] text-white/70">
              confidential intents, settled on Bitcoin
            </div>
          </motion.div>
        </div>

        {/* ── content panel ─────────────────────── */}
        <div className="relative flex-1 p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-faint transition-colors hover:bg-surface-100 hover:text-ink"
            aria-label="close"
          >
            ✕
          </button>

          <div className="flex items-center gap-2">
            <h3 className="font-sans text-[18px] font-medium tracking-[-0.3px]">Intent #{intent.id}</h3>
            <Status status={intent.status} />
          </div>

          {/* settlement summary */}
          <motion.div
            initial={{ opacity: 0, y: LIFT.offsetY }}
            animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : LIFT.offsetY }}
            transition={LIFT.spring}
            className="mt-5 flex items-center justify-between gap-2 rounded-2xl border border-border-200 bg-surface-100 px-4 py-3.5"
          >
            <Amt logo={<SbtcLogo className="h-7 w-7" />} amount={amountIn} sym="sBTC" label="escrowed" />
            <ArrowRight className="h-4 w-4 shrink-0 text-faint" />
            <Amt
              logo={<UsdaLogo className="h-7 w-7" />}
              amount={filledFor ?? "sealed"}
              sym={filledFor ? "USDA" : ""}
              label={filledFor ? "delivered" : "min out hidden"}
              align="right"
            />
          </motion.div>

          {/* sealed commitment */}
          <motion.div
            initial={{ opacity: 0, y: LIFT.offsetY }}
            animate={{ opacity: stage >= 3 ? 1 : 0, y: stage >= 3 ? 0 : LIFT.offsetY }}
            transition={LIFT.spring}
            className="mt-3"
          >
            <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] text-muted">
              <Lock className="h-3.5 w-3.5 text-accent" /> sealed commitment
            </div>
            <div className="break-all font-doto text-[12px] leading-[1.5] text-accent">{intent.commit}</div>
          </motion.div>

          {/* rows */}
          <div className="mt-4 space-y-0.5">
            {[{ label: "Maker", node: <span className="font-mono text-[13px]">{shorten(intent.maker)}</span> }].map(
              (r, i) => (
                <Row key={r.label} index={i} stage={stage} label={r.label}>
                  {r.node}
                </Row>
              ),
            )}
            {txRows.map((r, i) => (
              <Row key={r.label} index={i + 1} stage={stage} label={r.label}>
                <TxLink txid={r.txid} />
              </Row>
            ))}
          </div>

          <p className="mt-4 border-t border-border pt-3 font-mono text-[11px] leading-[1.5] text-faint">
            the order — output token, price, recipient — never goes on-chain.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Amt({
  logo,
  amount,
  sym,
  label,
  align = "left",
}: {
  logo: React.ReactNode;
  amount: string;
  sym: string;
  label: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${align === "right" ? "items-end text-right" : "items-start"}`}>
      <div className="flex items-center gap-2">
        {align === "left" && logo}
        <span className="truncate font-sans text-[17px] font-semibold tracking-tight text-ink">
          {amount} {sym}
        </span>
        {align === "right" && logo}
      </div>
      <span className="font-mono text-[11px] text-faint">{label}</span>
    </div>
  );
}

function Row({
  index,
  stage,
  label,
  children,
}: {
  index: number;
  stage: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: ROWS.offsetY }}
      animate={{ opacity: stage >= 4 ? 1 : 0, y: stage >= 4 ? 0 : ROWS.offsetY }}
      transition={{ ...ROWS.spring, delay: index * ROWS.stagger }}
      className="flex items-center justify-between gap-4 py-1.5"
    >
      <span className="shrink-0 font-sans text-[13px] text-muted">{label}</span>
      <span className="text-right text-ink">{children}</span>
    </motion.div>
  );
}

function TxLink({ txid }: { txid: string }) {
  return (
    <a
      href={txUrl(txid)}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-1 font-mono text-[12px] text-accent hover:underline"
    >
      {`0x${txid.replace(/^0x/, "").slice(0, 8)}…${txid.replace(/^0x/, "").slice(-6)}`}
      <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
    </a>
  );
}

function Status({ status }: { status: FeedIntent["status"] }) {
  const cls =
    status === "filled"
      ? "bg-[#e7f6ee] text-sealed"
      : status === "cancelled"
        ? "bg-surface-200 text-muted"
        : "bg-accent-wash text-accent";
  return <span className={`rounded-full px-2.5 py-1 font-mono text-[11px] ${cls}`}>{status}</span>;
}
