import StepFigure from "../how/StepFigure";
import { CommitDiagram, AuctionDiagram, RevealDiagram, SettleDiagram } from "../how/diagrams";
import Architecture from "./Architecture";

const STEPS = [
  {
    title: "Commit & escrow",
    body: "You sign an intent and lock sBTC. The contract stores only a sha256 commitment plus the escrow size — the token-out, price, and recipient never go public.",
    Figure: CommitDiagram,
  },
  {
    title: "Solver auction",
    body: "Solver agents compete in a sealed-bid auction. Each commits to a price before revealing it, so no one can see a rival's bid or frontrun. The best fill wins.",
    Figure: AuctionDiagram,
  },
  {
    title: "Sealed reveal",
    body: "You reveal the order encrypted to the winning solver's key (ECIES). The relay only ever holds ciphertext, and the losing solvers learn nothing.",
    Figure: RevealDiagram,
  },
  {
    title: "Verify & settle",
    body: "The contract recomputes the hash of the revealed fill and checks it matches your commitment. Only on a match does it release the escrow — trustless, on Bitcoin.",
    Figure: SettleDiagram,
  },
];

export default function HowSection() {
  return (
    <section id="how" className="scroll-mt-24 border-t border-border py-24">
      <div className="mx-auto max-w-[1080px] px-6">
        <p className="font-mono text-[12px] uppercase tracking-wide text-accent">the solution</p>
        <h2 className="mt-3 max-w-[680px] font-sans text-[40px] font-normal leading-[1.05] tracking-[-1.6px] text-ink">
          Sigil seals the order end to end — one intent, four sealed steps.
        </h2>

        <div className="mt-16 flex flex-col gap-24">
          {STEPS.map((s, i) => (
            <StepFigure key={s.title} index={i + 1} title={s.title} body={s.body} reverse={i % 2 === 1}>
              <s.Figure tone="lilac" />
            </StepFigure>
          ))}
        </div>

        {/* system overview */}
        <div id="architecture" className="mt-28 scroll-mt-24">
          <p className="font-mono text-[12px] uppercase tracking-wide text-accent">architecture</p>
          <h3 className="mt-3 max-w-[560px] font-sans text-[30px] font-normal leading-[1.1] tracking-[-1.2px] text-ink">
            How the pieces fit together.
          </h3>
          <div
            className="mt-8 overflow-hidden rounded-[18px] p-6 ring-1 ring-black/[0.04]"
            style={{ background: "radial-gradient(120% 120% at 50% 0%, #f7f5ff 0%, #efebff 100%)" }}
          >
            <Architecture />
          </div>
        </div>
      </div>
    </section>
  );
}
