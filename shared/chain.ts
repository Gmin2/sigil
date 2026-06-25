// On-chain integration against the local devnet. Wraps @stacks/transactions so
// the maker can escrow (create-intent) and a solver can settle (fill-intent).

import {
  makeContractCall,
  broadcastTransaction,
  fetchCallReadOnlyFunction,
  cvToJSON,
  Cl,
  PostConditionMode,
  type ClarityValue,
} from "@stacks/transactions";
import type { Reveal } from "./intent.ts";

const NODE = process.env.STACKS_NODE ?? "http://localhost:20443";

// devnet deployer; contracts live under this principal.
export const DEPLOYER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

// devnet keys + addresses from settings/Devnet.toml
export const KEYS = {
  deployer: "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601",
  wallet_1: "7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801",
  wallet_2: "530d9f61984c888536871c6573073bdfc0058896dc1adfe9a6a10dfacadc209101",
  wallet_3: "d655b2523bcd65e34889725c73064feb17ceb796831c0e111ba1a552b0f31b3901",
};

export const ADDRS = {
  deployer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  wallet_1: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
  wallet_2: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
  wallet_3: "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC",
};

export const SBTC = `${ADDRS.deployer}.mock-sbtc`;
export const USDA = `${ADDRS.deployer}.mock-usda`;

const NET = "devnet" as const;
const CLIENT = { baseUrl: NODE };

async function call(opts: {
  contract: string;
  fn: string;
  args: ClarityValue[];
  senderKey: string;
}): Promise<string> {
  const [contractAddress, contractName] = opts.contract.split(".");
  const tx = await makeContractCall({
    contractAddress,
    contractName,
    functionName: opts.fn,
    functionArgs: opts.args,
    senderKey: opts.senderKey,
    network: NET,
    client: CLIENT,
    postConditionMode: PostConditionMode.Allow,
    fee: 3000,
  });
  const result = await broadcastTransaction({ transaction: tx, network: NET, client: CLIENT });
  if ("error" in result) throw new Error(`${result.error}: ${(result as any).reason ?? ""}`);
  return result.txid;
}

function contractCV(id: string) {
  const [addr, name] = id.split(".");
  return Cl.contractPrincipal(addr, name);
}

export function faucet(token: string, amount: bigint, senderKey: string) {
  return call({ contract: token, fn: "faucet", args: [Cl.uint(amount)], senderKey });
}

export function createIntent(p: {
  id: number;
  tokenIn: string;
  amountIn: bigint;
  commit: string;
  expiry: number;
  senderKey: string;
}) {
  return call({
    contract: `${DEPLOYER}.intent-verifier`,
    fn: "create-intent",
    args: [
      Cl.uint(p.id),
      contractCV(p.tokenIn),
      Cl.uint(p.amountIn),
      Cl.bufferFromHex(p.commit.replace(/^0x/, "")),
      Cl.uint(p.expiry),
    ],
    senderKey: p.senderKey,
  });
}

export function fillIntent(p: {
  id: number;
  tokenIn: string;
  amountOut: bigint;
  reveal: Reveal;
  senderKey: string;
}) {
  return call({
    contract: `${DEPLOYER}.intent-verifier`,
    fn: "fill-intent",
    args: [
      Cl.uint(p.id),
      contractCV(p.tokenIn),
      contractCV(p.reveal.tokenOut),
      Cl.uint(p.amountOut),
      Cl.uint(BigInt(p.reveal.minOut)),
      Cl.principal(p.reveal.recipient),
      Cl.bufferFromHex(p.reveal.salt.replace(/^0x/, "")),
    ],
    senderKey: p.senderKey,
  });
}

// returns null when the intent does not exist, else clean primitive fields.
// status is "0" open, "1" filled, "2" cancelled.
export async function getIntent(id: number): Promise<null | {
  maker: string;
  tokenIn: string;
  amountIn: string;
  status: string;
  expiry: string;
  commit: string;
}> {
  const res = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName: "intent-verifier",
    functionName: "get-intent",
    functionArgs: [Cl.uint(id)],
    senderAddress: DEPLOYER,
    network: NET,
    client: CLIENT,
  });
  const j = cvToJSON(res);
  if (!j.value) return null; // (optional) none
  const t = j.value.value;
  return {
    maker: t.maker.value,
    tokenIn: t["token-in"].value,
    amountIn: t["amount-in"].value,
    status: t.status.value,
    expiry: t.expiry.value,
    commit: t.commit.value,
  };
}

export async function waitFor<T>(
  label: string,
  fn: () => Promise<T>,
  ok: (v: T) => boolean,
  tries = 40,
  delayMs = 3000,
): Promise<T> {
  for (let i = 0; i < tries; i++) {
    const v = await fn();
    if (ok(v)) return v;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`timed out waiting for: ${label}`);
}

export async function getBalance(token: string, who: string): Promise<bigint> {
  const [addr, name] = token.split(".");
  const res: any = await fetchCallReadOnlyFunction({
    contractAddress: addr,
    contractName: name,
    functionName: "get-balance",
    functionArgs: [Cl.principal(who)],
    senderAddress: DEPLOYER,
    network: NET,
    client: CLIENT,
  });
  // (ok uint)
  return BigInt(res.value?.value ?? 0);
}

export async function nodeReady(): Promise<boolean> {
  try {
    const r = await fetch(`${NODE}/v2/info`);
    if (!r.ok) return false;
    const info: any = await r.json();
    return typeof info.stacks_tip_height === "number";
  } catch {
    return false;
  }
}
