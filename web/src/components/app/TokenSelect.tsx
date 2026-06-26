import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Check } from "../icons";
import { TOKEN_LIST, TokenImg, type Token } from "../tokens";

export default function TokenSelect({
  token,
  exclude,
  onSelect,
}: {
  token: Token;
  exclude?: string; // symbol to hide (the other side of the swap)
  onSelect: (t: Token) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full py-1 pr-2 transition-colors hover:bg-black/[0.04]"
      >
        <TokenImg token={token} className="size-10" />
        <span className="font-sans text-[16px] font-semibold text-ink">{token.symbol}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-faint">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, scale: 0.97, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute left-0 top-[calc(100%+8px)] z-20 w-[260px] overflow-hidden rounded-2xl border border-border bg-white p-1.5 shadow-[0_12px_40px_rgba(20,20,40,0.12)]"
          >
            {TOKEN_LIST.filter((t) => t.symbol !== exclude).map((t) => {
              const active = t.symbol === token.symbol;
              return (
                <button
                  key={t.symbol}
                  onClick={() => {
                    onSelect(t);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-surface-100"
                >
                  <TokenImg token={t} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <div className="font-sans text-[15px] font-medium text-ink">{t.symbol}</div>
                    <div className="font-text text-[12px] text-muted">{t.name}</div>
                  </div>
                  <span className="font-mono text-[12px] text-faint">{fmt(t.balance)}</span>
                  {active && <Check className="h-4 w-4 text-accent" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: n < 1 ? 4 : 2 });
}
