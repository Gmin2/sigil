import { motion } from "motion/react";

// the Sigil mark: a rounded square with a double-slash. on mount the square
// strokes itself in, then the two slashes draw; on hover it rotates a quarter
// turn and springs back.
export function AnimatedLogo({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      initial="hidden"
      animate="visible"
      whileHover={{ rotate: 90 }}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      transition={{ rotate: { type: "spring", stiffness: 220, damping: 14 } }}
    >
      <motion.rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="2.4"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
        transition={{ duration: 0.7, ease: [0.44, 0, 0.56, 1] }}
      />
      <motion.path
        d="M8 14.5 14.5 8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
        transition={{ duration: 0.4, delay: 0.55, ease: "easeOut" }}
      />
      <motion.path
        d="M11 17 17 11"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
        transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
