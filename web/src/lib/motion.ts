import type { Variants } from "motion/react";

// easing from aave motion.json — cubic-bezier(0.19, 1, 0.22, 1)
export const easeExpo: [number, number, number, number] = [0.19, 1, 0.22, 1];

// hero text reveal: opacity 937ms, 300ms delay, easeExpo
export const heroReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.937, delay: 0.3 + i * 0.12, ease: easeExpo },
  }),
};

// scroll-into-view fade+rise for cards/sections
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: easeExpo },
  }),
};

export const viewportOnce = { once: true, amount: 0.3 } as const;

// spring presets (interface-craft conventions)
export const springs = {
  card: { type: "spring" as const, stiffness: 300, damping: 30 },
  snappy: { type: "spring" as const, stiffness: 500, damping: 25 },
  slide: { type: "spring" as const, stiffness: 350, damping: 28 },
};
