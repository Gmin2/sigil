// Maker flow: faucet sBTC, escrow an intent on-chain, then publish it (with the
// hidden reveal) to the relay so solvers can compete to fill it.

import {
  KEYS, ADDRS, SBTC, USDA,
  createIntent, getBalance, getIntent, waitFor, nodeReady,
} from "../shared/chain.ts";
import { commitHash, newSalt, type Reveal } from "../shared/intent.ts";
import { sealTo } from "../shared/crypto.ts";

const RELAY = process.env.RELAY ?? "http://localhost:8788";
const id = Number(process.env.ID ?? Math.floor(Date.now() / 1000) % 1_000_000);
const amountIn = BigInt(process.env.AMOUNT_IN ?? "100000000"); // 1 sBTC
const minOut = BigInt(process.env.MIN_OUT ?? "50000000"); // 50 USDA

async function main() {
  await waitFor("node", nodeReady, (v) => v === true);

  const reveal: Reveal = { tokenOut: USDA, minOut: String(minOut), recipient: ADDRS.wallet_1, salt: newSalt() };
  const commit = commitHash(reveal);

  console.log(`maker escrowing intent #${id} (${amountIn} sBTC, min ${minOut} USDA)`);
  // sBTC is auto-funded on devnet; no faucet needed
  await waitFor("maker sbtc", () => getBalance(SBTC, ADDRS.wallet_1), (b) => b >= amountIn);
  const createTxid = await createIntent({ id, tokenIn: SBTC, amountIn, commit, expiry: 1_000_000, senderKey: KEYS.wallet_1 });
  await waitFor("intent open", () => getIntent(id), (i) => i?.status === "0");
  console.log(`  escrowed on-chain, commit ${commit.slice(0, 14)}...`);

  // seal the reveal to every registered solver so the relay only sees ciphertext.
  const reg = await (await fetch(`${RELAY}/solvers`)).json();
  const solverKeys: string[] = reg.solvers ?? [];
  if (solverKeys.length === 0) throw new Error("no registered solvers to seal to");
  const seals: Record<string, string> = {};
  for (const pub of solverKeys) seals[pub] = sealTo(pub, reveal);

  const r = await fetch(`${RELAY}/intents`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, tokenIn: SBTC, amountIn: String(amountIn), expiry: 1_000_000, maker: ADDRS.wallet_1, commit, seals, createTxid }),
  });
  const body = await r.json();
  if (body.commit !== commit) throw new Error(`relay commit ${body.commit} != on-chain commit ${commit}`);
  console.log(`  published to relay (id ${id}); reveal sealed to ${solverKeys.length} solver key(s), relay holds only ciphertext`);
}

main().catch((e) => {
  console.error("maker error:", e.message);
  process.exit(1);
});
