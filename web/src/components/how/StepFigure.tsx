import type { ReactNode } from "react";

// one lifecycle step: text on one side, the animated figure on the other.
export default function StepFigure({
  index,
  title,
  body,
  reverse,
  children,
}: {
  index: number;
  title: string;
  body: string;
  reverse?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <div className={reverse ? "md:order-2" : ""}>
        <span className="font-mono text-[13px] text-faint">{String(index).padStart(2, "0")}</span>
        <h2 className="mt-2 font-sans text-[30px] font-normal leading-[1.1] tracking-[-1.2px] text-ink">{title}</h2>
        <p className="mt-3 max-w-[420px] font-text text-[16px] leading-[24px] text-muted">{body}</p>
      </div>
      <div className={reverse ? "md:order-1" : ""}>{children}</div>
    </div>
  );
}

// aave-docs-style tinted panel that the illustration sits on.
export const FRAME_TONES: Record<string, string> = {
  lilac: "radial-gradient(120% 120% at 50% 0%, #f7f5ff 0%, #efebff 100%)",
  iris: "radial-gradient(120% 120% at 50% 0%, #efecff 0%, #e4dfff 100%)",
  paper: "radial-gradient(120% 120% at 50% 0%, #fbfbfd 0%, #f1f1f5 100%)",
  mint: "radial-gradient(120% 120% at 50% 0%, #f1fbf6 0%, #e6f6ee 100%)",
};

export function FigureFrame({ children, tone = "lilac" }: { children: ReactNode; tone?: string }) {
  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] ring-1 ring-black/[0.04]"
      style={{ background: FRAME_TONES[tone] ?? FRAME_TONES.lilac }}
    >
      {children}
    </div>
  );
}
