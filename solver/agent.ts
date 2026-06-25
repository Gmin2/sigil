// Obscura solver agent (crude). Polls the relay for open intents, fetches the
// hidden reveal, and produces a concrete fill plan. No pricing intelligence and
// no on-chain submission yet - those are the next increments.

import { commitHash, type Reveal } from "../shared/intent.ts";

const RELAY = process.env.RELAY ?? "http://localhost:8788";

type FillPlan = {
  id: number;
  tokenIn: string;
  amountIn: string;
  tokenOut: string;
  amountOut: string; // what the solver will deliver
  recipient: string;
  salt: string;
  commitOk: boolean; // does the reveal hash back to the on-chain commitment
};

async function planFor(id: number): Promise<FillPlan | null> {
  const r = await fetch(`${RELAY}/intents/${id}/reveal`);
  if (!r.ok) return null;
  const { tokenIn, amountIn, reveal } = (await r.json()) as {
    tokenIn: string;
    amountIn: string;
    reveal: Reveal;
  };
  // crude pricing: deliver exactly the minimum the maker asked for.
  return {
    id,
    tokenIn,
    amountIn,
    tokenOut: reveal.tokenOut,
    amountOut: reveal.minOut,
    recipient: reveal.recipient,
    salt: reveal.salt,
    commitOk: false, // set in pollOnce after checking against the public commit
  };
}

async function pollOnce(): Promise<FillPlan[]> {
  const res = await fetch(`${RELAY}/intents`);
  const { intents } = (await res.json()) as { intents: { id: number; commit: string }[] };
  const plans: FillPlan[] = [];
  for (const i of intents) {
    const plan = await planFor(i.id);
    if (!plan) continue;
    // confirm the reveal we fetched actually hashes to the public commitment.
    const local = commitHash({
      tokenOut: plan.tokenOut,
      minOut: plan.amountOut,
      recipient: plan.recipient,
      salt: plan.salt,
    });
    plan.commitOk = local === i.commit;
    plans.push(plan);
  }
  return plans;
}

const once = process.argv.includes("--once");

async function loop() {
  do {
    const plans = await pollOnce();
    if (plans.length === 0) {
      console.log("no open intents");
    } else {
      for (const p of plans) {
        console.log(
          `fill plan: intent #${p.id}  ${p.amountIn} ${short(p.tokenIn)} -> ${p.amountOut} ${short(p.tokenOut)}  commitOk=${p.commitOk}`,
        );
      }
    }
    if (!once) await sleep(2000);
  } while (!once);
}

function short(c: string) {
  const name = c.split(".")[1] ?? c;
  return name;
}
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

loop();
