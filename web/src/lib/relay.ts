import { RELAY } from "./config";
import { sealTo } from "./seal";
import type { Reveal } from "./intent";

export type RelayIntent = {
  id: number;
  tokenIn: string;
  amountIn: string;
  expiry: number;
  commit: string;
  maker: string;
  status: "open" | "filled" | "cancelled";
  createdAt: number;
};

export type RelayAuction = {
  status: "no-bids" | "bidding" | "closed";
  bids?: number;
  winner?: string | null;
  amountOut?: string;
};

export async function getSolvers(): Promise<string[]> {
  const r = await fetch(`${RELAY}/solvers`);
  return ((await r.json()) as { solvers: string[] }).solvers ?? [];
}

export async function getIntents(): Promise<RelayIntent[]> {
  const r = await fetch(`${RELAY}/intents`);
  return ((await r.json()) as { intents: RelayIntent[] }).intents ?? [];
}

export async function getAuction(id: number): Promise<RelayAuction> {
  const r = await fetch(`${RELAY}/intents/${id}/auction`);
  return r.json();
}

// seal the reveal to every registered solver and post the intent (ciphertext only).
export async function publishIntent(p: {
  id: number;
  tokenIn: string;
  amountIn: string;
  expiry: number;
  maker: string;
  commit: string;
  reveal: Reveal;
}): Promise<number> {
  const solvers = await getSolvers();
  const seals: Record<string, string> = {};
  for (const pub of solvers) seals[pub] = sealTo(pub, p.reveal);
  const r = await fetch(`${RELAY}/intents`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: p.id, tokenIn: p.tokenIn, amountIn: p.amountIn, expiry: p.expiry, maker: p.maker, commit: p.commit, seals }),
  });
  if (!r.ok) throw new Error(`relay rejected intent: ${r.status}`);
  return solvers.length;
}
