import { useEffect, useRef, useState, type ReactNode } from "react";

/* lightweight scroll area with the skiper87 "fade while scroll" effect:
 * a top fade appears once you've scrolled down, a bottom fade while more
 * content remains below. no radix / shadcn needed. */
export function ScrollArea({
  className = "",
  fadeColor = "#ffffff",
  children,
}: {
  className?: string;
  fadeColor?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(false);
  const [bottom, setBottom] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setTop(el.scrollTop > 4);
    setBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  };

  // recompute on every render so added/removed rows refresh the fades
  useEffect(update);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={ref}
        onScroll={update}
        className="h-full overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-200 [&::-webkit-scrollbar]:w-1.5"
      >
        {children}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-12 transition-opacity duration-200"
        style={{ background: `linear-gradient(to bottom, ${fadeColor}, transparent)`, opacity: top ? 1 : 0 }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 transition-opacity duration-200"
        style={{ background: `linear-gradient(to top, ${fadeColor}, transparent)`, opacity: bottom ? 1 : 0 }}
      />
    </div>
  );
}
