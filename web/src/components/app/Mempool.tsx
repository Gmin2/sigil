/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Mempool (skiper87 fade-scroll list)
 *
 *    on mount   each row fades + rises in, staggered 40ms by index
 *    on seal    a freshly sealed intent prepends, flashes iris, settles
 *    on status  the badge swaps (old rolls up / new rolls in)
 * Rows live in a ScrollArea that fades top/bottom while scrolling.
 * ───────────────────────────────────────────────────────── */

import { AnimatePresence, motion } from "motion/react";
import { ScrollArea } from "../ui/ScrollArea";
import { shorten } from "../../lib/format";

export type RowStatus = "open" | "bidding" | "filled" | "cancelled";

export type Row = {
  id: number;
  sbtc: string;
  commit: string;
  expiry: number;
  status: RowStatus;
  fill?: string;
  isNew?: boolean;
  txid?: string;
};

const ROW = {
  stagger: 0.04,
  offsetY: 10,
  flash: "rgba(90,75,255,0.1)",
  spring: { type: "spring" as const, stiffness: 320, damping: 32 },
};

export default function Mempool({ rows }: { rows: Row[] }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="font-sans text-[18px] font-medium tracking-[-0.3px]">Mempool</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-surface-100 px-2 py-0.5 font-mono text-[11px] text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sealed opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sealed" />
            </span>
            live
          </span>
        </div>
        <span className="font-mono text-[12px] text-faint">what observers see · {rows.length}</span>
      </div>

      <ScrollArea className="h-[420px] rounded-2xl border border-border">
        <div className="space-y-1 p-2">
          <AnimatePresence initial={false}>
            {rows.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: ROW.offsetY }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ ...ROW.spring, delay: r.isNew ? 0 : i * ROW.stagger }}
                className="relative isolate flex h-12 items-center rounded-lg bg-surface-100 text-[14px] hover:bg-surface-200"
              >
                {r.isNew && (
                  <motion.span
                    className="pointer-events-none absolute inset-0 z-0 rounded-lg"
                    style={{ background: ROW.flash }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.6, ease: "easeOut" }}
                  />
                )}
                <div className="relative z-10 flex w-full items-center gap-3 px-4">
                  <span className="w-9 shrink-0 font-mono text-muted">#{r.id}</span>
                  <span className="w-24 shrink-0 font-medium text-ink">{r.sbtc} sBTC</span>
                  <span className="shrink-0 font-doto text-[13px] text-accent">{shorten(r.commit, 6, 4)}</span>
                  <div className="h-px flex-1 bg-border-200" />
                  <StatusBadge status={r.status} fill={r.fill} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </section>
  );
}

function StatusBadge({ status, fill }: { status: RowStatus; fill?: string }) {
  return (
    <span className="relative inline-flex h-[26px] shrink-0 items-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        >
          <Pill status={status} fill={fill} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Pill({ status, fill }: { status: RowStatus; fill?: string }) {
  if (status === "bidding") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-accent-wash px-2.5 py-1 font-mono text-[12px] text-accent">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-accent"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        bidding
      </span>
    );
  }
  if (status === "filled") {
    return (
      <span className="rounded-full bg-[#e7f6ee] px-2.5 py-1 font-mono text-[12px] text-sealed">
        {fill ? `filled · ${fill}` : "filled"}
      </span>
    );
  }
  if (status === "cancelled") {
    return <span className="rounded-full bg-surface-200 px-2.5 py-1 font-mono text-[12px] text-muted">cancelled</span>;
  }
  return <span className="rounded-full bg-accent-wash px-2.5 py-1 font-mono text-[12px] text-accent">open</span>;
}
