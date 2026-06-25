// Obscura solver agent. Polls the relay for open intents, fetches the hidden
// reveal, verifies it hashes to the public commitment, then settles the intent
// on-chain by submitting fill-intent. Crude pricing fills exactly min-out.

import { commitHash, type Reveal } from "../shared/intent.ts";
import {
  KEYS, USDA, faucet, fillIntent, getIntent, getBalance, waitFor, nodeReady, ADDRS,
} from "../shared/chain.ts";

const RELAY = process.env.RELAY ?? "http://localhost:8788";
const SOLVER_KEY = KEYS.wallet_2;
const once = process.argv.includes("--once");

const handled = new Set<number>();

type Public = { id: number; commit: string };

async function fetchReveal(id: number): Promise<Reveal | null> {
  const r = await fetch(`${RELAY}/intents/${id}/reveal`);
  if (!r.ok) return null;
  return ((await r.json()) as { reveal: Reveal }).reveal;
}

async function tryFill(p: Public): Promise<void> {
  if (handled.has(p.id)) return;
  const reveal = await fetchReveal(p.id);
  if (!reveal) return;

  // refuse anything whose reveal does not hash to the public commitment.
  if (commitHash(reveal) !== p.commit) {
    console.log(`#${p.id} commit mismatch, skipping`);
    return;
  }
  // the intent must still be open on-chain.
  const onchain = await getIntent(p.id);
  if (onchain?.status !== "0") return;

  handled.add(p.id);
  const amountOut = BigInt(reveal.minOut); // crude: fill exactly the minimum
  console.log(`#${p.id} filling on-chain (deliver ${amountOut} ${reveal.tokenOut.split(".")[1]})`);
  try {
    const txid = await fillIntent({ id: p.id, tokenIn: onchain.tokenIn, amountOut, reveal, senderKey: SOLVER_KEY });
    console.log(`  fill broadcast ${txid.slice(0, 12)}, waiting for settlement...`);
    await waitFor(`#${p.id} filled`, () => getIntent(p.id), (i) => i?.status === "1");
    await fetch(`${RELAY}/intents/${p.id}/filled`, { method: "POST" });
    console.log(`  #${p.id} settled on-chain`);
  } catch (e) {
    handled.delete(p.id); // allow a retry next pass
    console.log(`  #${p.id} fill failed: ${(e as Error).message}`);
  }
}

async function pollOnce(): Promise<void> {
  const res = await fetch(`${RELAY}/intents`);
  const { intents } = (await res.json()) as { intents: Public[] };
  if (intents.length === 0) {
    console.log("no open intents");
    return;
  }
  for (const p of intents) await tryFill(p);
}

async function main() {
  await waitFor("node", nodeReady, (v) => v === true);
  // make sure the solver can pay out the output token. only faucet when low, and
  // wait for it to mine (so the nonce advances before we submit a fill).
  const bal = await getBalance(USDA, ADDRS.wallet_2);
  if (bal < 100_000_000n) {
    await faucet(USDA, 1_000_000_000n, SOLVER_KEY);
    await waitFor("solver funded", () => getBalance(USDA, ADDRS.wallet_2), (b) => b >= bal + 1_000_000_000n);
  }
  console.log(`solver ready (USDA balance ${await getBalance(USDA, ADDRS.wallet_2)})`);

  do {
    await pollOnce();
    if (!once) await new Promise((r) => setTimeout(r, 2000));
  } while (!once);
}

main().catch((e) => {
  console.error("solver error:", e.message);
  process.exit(1);
});
