export const DEPLOYER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

// official sBTC token, remapped to the deployer on devnet and auto-funded.
export const SBTC_DEPLOYER = DEPLOYER;
export const SBTC = `${SBTC_DEPLOYER}.sbtc-token`;

export const CONTRACTS = {
  verifier: `${DEPLOYER}.intent-verifier`,
  sbtc: SBTC,
  usda: `${DEPLOYER}.mock-usda`,
};

// browser wallets sign against the network they are set to; the user points
// Leather at its devnet network (localhost:3999).
export const NETWORK = "devnet" as const;

// where the landing CTAs send people: the app subdomain in production, the
// local /app route in dev. override with VITE_APP_URL.
export const APP_URL =
  import.meta.env.VITE_APP_URL ?? (import.meta.env.PROD ? "https://app.sigiils.xyz" : "/app");

export const RELAY = import.meta.env.VITE_RELAY ?? "http://localhost:8788";
// use the stacks-API for browser reads: the node RPC (20443) returns 405 on the
// CORS preflight, the API (3999) handles it.
export const NODE = import.meta.env.VITE_NODE ?? "http://localhost:3999";
export const EXPLORER = import.meta.env.VITE_EXPLORER ?? "http://localhost:8000";

// link to a transaction in the local devnet explorer
export const txUrl = (txid: string) =>
  `${EXPLORER}/txid/${txid}?chain=testnet&api=${NODE}`;
