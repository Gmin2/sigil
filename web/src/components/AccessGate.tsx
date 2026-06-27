import { useState } from "react";
import { motion } from "motion/react";
import { AnimatedLogo } from "./AnimatedLogo";
import { redeem } from "../lib/access";

const ease = [0.44, 0, 0.56, 1] as const;
const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease },
});

export default function AccessGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (redeem(code)) {
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-accent-wash/60 to-white" />

      <motion.div
        className="relative w-full max-w-[400px] text-center"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        <motion.div {...reveal(0.05)} className="flex flex-col items-center">
          <AnimatedLogo className="h-12 w-12 text-accent" />
          <div className="mt-3 flex items-center gap-2">
            <span className="font-sans text-[22px] font-medium tracking-[-0.6px] text-ink">Sigil</span>
            <span className="rounded-full bg-accent-wash px-2 py-0.5 font-mono text-[11px] text-accent">
              early access
            </span>
          </div>
        </motion.div>

        <motion.h1 {...reveal(0.15)} className="mt-8 font-sans text-[28px] font-normal tracking-[-1px] text-ink">
          youre early.
        </motion.h1>
        <motion.p {...reveal(0.22)} className="mx-auto mt-2 max-w-[320px] font-text text-[15px] leading-[22px] text-muted">
          Sigil is opening up to early customers in waves. drop your promo code to get in.
        </motion.p>

        <motion.form {...reveal(0.3)} onSubmit={submit} className="mt-7">
          <motion.div animate={error ? { x: [0, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              placeholder="promo code"
              autoFocus
              className={`w-full rounded-full border bg-white px-5 py-3.5 text-center font-mono text-[15px] text-ink outline-none transition-colors placeholder:text-faint ${
                error ? "border-[#d23b39]" : "border-border-200 focus:border-accent"
              }`}
            />
          </motion.div>

          <button
            type="submit"
            className="mt-3 w-full rounded-full bg-accent py-3.5 font-sans text-[16px] font-medium text-white transition-colors hover:bg-accent-600"
          >
            Continue
          </button>

          <div className="mt-3 h-4 font-mono text-[12px] text-[#d23b39]">
            {error && "that code isnt active yet. were rolling out soon."}
          </div>
        </motion.form>

        <motion.p {...reveal(0.4)} className="mt-2 font-mono text-[11px] text-faint">
          no code? were onboarding gradually, check back soon.
        </motion.p>
      </motion.div>
    </div>
  );
}
