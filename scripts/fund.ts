// Fund an arbitrary devnet address with STX (for fees) and sBTC (to escrow),
// sent from the auto-funded wallet_1. Usage: TO=ST... node scripts/fund.ts

import {
  makeSTXTokenTransfer, makeContractCall, broadcastTransaction,
  fetchNonce, Cl, PostConditionMode,
} from "@stacks/transactions";
import { KEYS, ADDRS, SBTC } from "../shared/chain.ts";

const NODE = process.env.STACKS_NODE ?? "http://localhost:20443";
const NET = "devnet" as const;
const CLIENT = { baseUrl: NODE };
const to = process.env.TO!;
const stx = BigInt(process.env.STX ?? "1000000000"); // 1000 STX
const sbtc = BigInt(process.env.SBTC_AMOUNT ?? "500000000"); // 5 sBTC

async function main() {
  if (!to) throw new Error("set TO=<address>");
  let nonce = await fetchNonce({ address: ADDRS.wallet_1, network: NET, client: CLIENT });

  const stxTx = await makeSTXTokenTransfer({
    recipient: to, amount: stx, senderKey: KEYS.wallet_1, network: NET, client: CLIENT, nonce, fee: 3000,
  });
  const r1 = await broadcastTransaction({ transaction: stxTx, network: NET, client: CLIENT });
  console.log("STX transfer:", (r1 as any).txid ?? r1);

  const [addr, name] = SBTC.split(".");
  const sbtcTx = await makeContractCall({
    contractAddress: addr, contractName: name, functionName: "transfer",
    functionArgs: [Cl.uint(sbtc), Cl.principal(ADDRS.wallet_1), Cl.principal(to), Cl.none()],
    senderKey: KEYS.wallet_1, network: NET, client: CLIENT,
    postConditionMode: PostConditionMode.Allow, nonce: nonce + 1n, fee: 3000,
  });
  const r2 = await broadcastTransaction({ transaction: sbtcTx, network: NET, client: CLIENT });
  console.log("sBTC transfer:", (r2 as any).txid ?? r2);
  console.log(`funded ${to} with ${stx} uSTX and ${sbtc} sats sBTC`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
