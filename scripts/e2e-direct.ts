// Direct on-chain happy path against the devnet: faucet, escrow, fill, verify.
// No relay/solver processes yet - this proves shared/chain.ts settles for real.

import {
  KEYS, ADDRS, SBTC, USDA,
  faucet, createIntent, fillIntent, getIntent, getBalance, waitFor, nodeReady,
} from "../shared/chain.ts";
import { commitHash, newSalt, type Reveal } from "../shared/intent.ts";

const id = Number(process.env.ID ?? Math.floor(Date.now() / 1000) % 1_000_000);
const amountIn = 100_000_000n; // 1 sBTC
const minOut = 50_000_000n; // 50 USDA
const amountOut = 55_000_000n; // solver delivers above min

async function main() {
  console.log("waiting for node...");
  await waitFor("node", nodeReady, (v) => v === true);
  console.log("waiting for intent-verifier deployment...");
  await waitFor("deploy", () => getIntent(id).then(() => true).catch(() => false), (v) => v);

  const reveal: Reveal = { tokenOut: USDA, minOut: String(minOut), recipient: ADDRS.wallet_1, salt: newSalt() };
  const commit = commitHash(reveal);

  console.log(`\nsolver faucet +100 USDA (sBTC is auto-funded on devnet)`);
  await faucet(USDA, 100_000_000n, KEYS.wallet_2);
  await waitFor("maker sbtc", () => getBalance(SBTC, ADDRS.wallet_1), (b) => b >= amountIn);
  await waitFor("solver usda", () => getBalance(USDA, ADDRS.wallet_2), (b) => b >= amountOut);

  const makerSbtc0 = await getBalance(SBTC, ADDRS.wallet_1);
  const makerUsda0 = await getBalance(USDA, ADDRS.wallet_1);
  const solverSbtc0 = await getBalance(SBTC, ADDRS.wallet_2);

  console.log(`\ncreate-intent #${id} (escrow ${amountIn} sBTC, commit ${commit.slice(0, 12)}...)`);
  await createIntent({ id, tokenIn: SBTC, amountIn, commit, expiry: 1_000_000, senderKey: KEYS.wallet_1 });
  await waitFor("intent open", () => getIntent(id), (i) => i?.status === "0");
  console.log("  escrowed. maker sBTC went from", makerSbtc0, "to", await getBalance(SBTC, ADDRS.wallet_1));

  console.log(`\nfill-intent #${id} (solver delivers ${amountOut} USDA, reveals salt)`);
  await fillIntent({ id, tokenIn: SBTC, amountOut, reveal, senderKey: KEYS.wallet_2 });
  await waitFor("intent filled", () => getIntent(id), (i) => i?.status === "1");

  const makerUsda1 = await getBalance(USDA, ADDRS.wallet_1);
  const solverSbtc1 = await getBalance(SBTC, ADDRS.wallet_2);

  console.log("\n=== settlement ===");
  console.log("maker USDA:", makerUsda0, "->", makerUsda1, `(+${makerUsda1 - makerUsda0})`);
  console.log("solver sBTC:", solverSbtc0, "->", solverSbtc1, `(+${solverSbtc1 - solverSbtc0})`);

  const ok = makerUsda1 - makerUsda0 === amountOut && solverSbtc1 - solverSbtc0 === amountIn;
  console.log(ok ? "\nPASS: settled correctly on devnet" : "\nFAIL: balances wrong");
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error("error:", e.message);
  process.exit(1);
});
