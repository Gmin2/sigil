// Obscura solver agent. Polls the relay for open intents, decrypts the reveal
// sealed to its key, verifies it hashes to the public commitment, competes in
// the sealed-bid auction (deliver min-out plus a margin), and if it wins settles
// the intent on-chain with fill-intent.

import { createHash, randomBytes } from "node:crypto";
import { commitHash, type Reveal } from "../shared/intent.ts";
import { genSolverKey, open } from "../shared/crypto.ts";
import {
  KEYS, USDA, faucet, fillIntent, getIntent, getBalance, waitFor, nodeReady, ADDRS,
} from "../shared/chain.ts";

const RELAY = process.env.RELAY ?? "http://localhost:8788";
// which devnet wallet this solver settles from (so competing solvers differ).
const WALLET = (process.env.SOLVER_WALLET ?? "wallet_2") as "wallet_2" | "wallet_3";
const SOLVER_KEY = KEYS[WALLET];
const SOLVER_ADDR = ADDRS[WALLET];
// how much above min-out this solver is willing to deliver. competing solvers
// run with different margins; the higher bid wins the maker's intent.
const MARGIN = BigInt(process.env.MARGIN ?? "0");
const once = process.argv.includes("--once");

function bidCommit(amountOut: string, salt: string): string {
  return createHash("sha256").update(`${amountOut}:${salt}`).digest("hex");
}

function post(path: string, body: unknown) {
  return fetch(`${RELAY}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ECIES keypair makers seal reveals to. the relay never learns the private key.
const enc = genSolverKey();

const handled = new Set<number>();

type Public = { id: number; commit: string };

// fetch this solver's sealed reveal and decrypt it locally.
async function fetchReveal(id: number): Promise<Reveal | null> {
  const r = await fetch(`${RELAY}/intents/${id}/reveal?solver=${enc.pub}`);
  if (!r.ok) return null;
  const { seal } = (await r.json()) as { seal: string };
  try {
    return open<Reveal>(enc.priv, seal);
  } catch {
    return null; // not sealed to us / cannot decrypt
  }
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

  // bid into the sealed-bid auction: deliver min-out plus our margin.
  const amountOut = (BigInt(reveal.minOut) + MARGIN).toString();
  const salt = randomBytes(8).toString("hex");
  await post(`/intents/${p.id}/bid`, { solver: enc.pub, commit: bidCommit(amountOut, salt) });
  await post(`/intents/${p.id}/open`, { solver: enc.pub, amountOut, salt });
  console.log(`#${p.id} bid ${amountOut} ${reveal.tokenOut.split(".")[1]}, waiting for auction...`);

  // wait for the auction to close and see if we won.
  const result = await waitFor(
    `#${p.id} auction`,
    () => fetch(`${RELAY}/intents/${p.id}/auction`).then((r) => r.json()),
    (a: any) => a.status === "closed",
    20,
    1000,
  );
  if (result.winner !== enc.pub) {
    console.log(`#${p.id} lost auction (winner bid ${result.amountOut})`);
    return;
  }

  console.log(`#${p.id} won, filling on-chain (deliver ${amountOut})`);
  try {
    const txid = await fillIntent({ id: p.id, tokenIn: onchain.tokenIn, amountOut: BigInt(amountOut), reveal, senderKey: SOLVER_KEY });
    console.log(`  fill broadcast ${txid.slice(0, 12)}, waiting for settlement...`);
    await waitFor(`#${p.id} filled`, () => getIntent(p.id), (i) => i?.status === "1");
    await fetch(`${RELAY}/intents/${p.id}/filled`, { method: "POST" });
    console.log(`  #${p.id} settled on-chain`);
  } catch (e) {
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
  // register our encryption key so makers can seal reveals to us.
  await fetch(`${RELAY}/solvers`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pub: enc.pub }),
  });
  console.log(`registered solver key ${enc.pub.slice(0, 16)}...`);

  await waitFor("node", nodeReady, (v) => v === true);
  // make sure the solver can pay out the output token. only faucet when low, and
  // wait for it to mine (so the nonce advances before we submit a fill).
  const bal = await getBalance(USDA, SOLVER_ADDR);
  if (bal < 100_000_000n) {
    await faucet(USDA, 1_000_000_000n, SOLVER_KEY);
    await waitFor("solver funded", () => getBalance(USDA, SOLVER_ADDR), (b) => b >= bal + 1_000_000_000n);
  }
  console.log(`solver ready (USDA balance ${await getBalance(USDA, SOLVER_ADDR)})`);

  do {
    await pollOnce();
    if (!once) await new Promise((r) => setTimeout(r, 2000));
  } while (!once);
}

main().catch((e) => {
  console.error("solver error:", e.message);
  process.exit(1);
});
