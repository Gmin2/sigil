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

export const RELAY = import.meta.env.VITE_RELAY ?? "http://localhost:8788";
export const NODE = import.meta.env.VITE_NODE ?? "http://localhost:20443";
