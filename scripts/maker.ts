// Maker flow: faucet sBTC, escrow an intent on-chain, then publish it (with the
// hidden reveal) to the relay so solvers can compete to fill it.

import {
  KEYS, ADDRS, SBTC, USDA,
  faucet, createIntent, getBalance, getIntent, waitFor, nodeReady,
} from "../shared/chain.ts";
import { commitHash, newSalt, type Reveal } from "../shared/intent.ts";

const RELAY = process.env.RELAY ?? "http://localhost:8788";
const id = Number(process.env.ID ?? Math.floor(Date.now() / 1000) % 1_000_000);
const amountIn = BigInt(process.env.AMOUNT_IN ?? "100000000"); // 1 sBTC
const minOut = BigInt(process.env.MIN_OUT ?? "50000000"); // 50 USDA

async function main() {
  await waitFor("node", nodeReady, (v) => v === true);

  const reveal: Reveal = { tokenOut: USDA, minOut: String(minOut), recipient: ADDRS.wallet_1, salt: newSalt() };
  const commit = commitHash(reveal);

  console.log(`maker funding + escrowing intent #${id} (${amountIn} sBTC, min ${minOut} USDA)`);
  await faucet(SBTC, amountIn, KEYS.wallet_1);
  await waitFor("maker sbtc", () => getBalance(SBTC, ADDRS.wallet_1), (b) => b >= amountIn);
  await createIntent({ id, tokenIn: SBTC, amountIn, commit, expiry: 1_000_000, senderKey: KEYS.wallet_1 });
  await waitFor("intent open", () => getIntent(id), (i) => i?.status === "0");
  console.log(`  escrowed on-chain, commit ${commit.slice(0, 14)}...`);

  const r = await fetch(`${RELAY}/intents`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, tokenIn: SBTC, amountIn: String(amountIn), expiry: 1_000_000, maker: ADDRS.wallet_1, reveal }),
  });
  const body = await r.json();
  if (body.commit !== commit) throw new Error(`relay commit ${body.commit} != on-chain commit ${commit}`);
  console.log(`  published to relay (id ${id}); relay commit matches on-chain commit`);
}

main().catch((e) => {
  console.error("maker error:", e.message);
  process.exit(1);
});
