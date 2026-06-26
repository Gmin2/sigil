import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

// drives a single `stage` integer from timing marks (ms after trigger), loops
// while the figure is in view, resets when it scrolls away. replayKey forces a
// restart (click-to-replay); speed scales all timings (1 = as authored).
export function useStaged(
  marks: number[],
  loopMs: number,
  { replayKey = 0, speed = 1 }: { replayKey?: number; speed?: number } = {}
) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!inView) {
      setStage(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const k = 1 / Math.max(0.1, speed);
    const run = () => {
      setStage(0);
      marks.forEach((t, i) => timers.push(setTimeout(() => setStage(i + 1), t * k)));
      timers.push(setTimeout(run, loopMs * k));
    };
    run();
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, replayKey, speed]);

  return { ref, stage };
}
