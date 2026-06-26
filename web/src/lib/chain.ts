import { fetchCallReadOnlyFunction, cvToJSON, Cl } from "@stacks/transactions";
import { DEPLOYER, NODE } from "./config";

// read-only get-intent against the devnet node; returns the status string
// ("0" open, "1" filled, "2" cancelled) or null if it isn't on-chain yet.
export async function onChainStatus(id: number): Promise<string | null> {
  const res = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName: "intent-verifier",
    functionName: "get-intent",
    functionArgs: [Cl.uint(id)],
    senderAddress: DEPLOYER,
    network: "devnet",
    client: { baseUrl: NODE },
  });
  const j = cvToJSON(res);
  return j.value ? j.value.value.status.value : null;
}

// poll until the intent is escrowed on-chain (or time out).
export async function waitForEscrow(id: number, tries = 30, delayMs = 2000): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    if ((await onChainStatus(id).catch(() => null)) !== null) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

export async function sbtcBalance(address: string): Promise<bigint> {
  const res = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName: "sbtc-token",
    functionName: "get-balance",
    functionArgs: [Cl.principal(address)],
    senderAddress: DEPLOYER,
    network: "devnet",
    client: { baseUrl: NODE },
  });
  const j = cvToJSON(res);
  return BigInt(j.value?.value ?? 0);
}
