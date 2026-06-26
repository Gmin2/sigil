export const DEPLOYER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

export const CONTRACTS = {
  verifier: `${DEPLOYER}.intent-verifier`,
  sbtc: `${DEPLOYER}.mock-sbtc`,
  usda: `${DEPLOYER}.mock-usda`,
};

// browser wallets sign against the network they are set to; the user points
// Leather at its devnet network (localhost:3999).
export const NETWORK = "devnet" as const;

export const RELAY = import.meta.env.VITE_RELAY ?? "http://localhost:8788";
