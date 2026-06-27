import { motion } from "motion/react";
import SealConveyor from "./SealConveyor";
import { ArrowRight } from "../icons";
import { APP_URL } from "../../lib/config";

const ease = [0.44, 0, 0.56, 1] as const;

function reveal(delay: number) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease },
  };
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative mx-auto max-w-[1440px] px-6 pt-20 text-center md:px-10">
        <motion.h1
          {...reveal(0.05)}
          className="mx-auto max-w-[920px] font-sans text-[clamp(40px,7vw,72px)] font-normal leading-[1.02] tracking-[-2.88px] text-ink"
        >
          Private intents,
          <br />
          settled on Bitcoin.
        </motion.h1>

        <motion.p
          {...reveal(0.15)}
          className="mx-auto mt-5 max-w-[560px] font-text text-[18px] leading-[28px] tracking-[-0.45px] text-muted-2"
        >
          Sign an intent, escrow sBTC, and let solver agents compete to fill it.
          The chain sees only a commitment — no public order, no frontrunning.
        </motion.p>

        <motion.div {...reveal(0.25)} className="mt-8 flex items-center justify-center gap-3">
          <a
            href={APP_URL}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-sans text-[16px] font-medium text-white transition-colors hover:bg-accent-600"
          >
            Launch app
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-full border border-border-200 bg-white px-5 py-3 font-sans text-[16px] font-medium text-ink transition-colors hover:bg-surface-100"
          >
            How it works
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease }}
          className="mt-16"
        >
          <SealConveyor />
        </motion.div>
      </div>
    </section>
  );
}
