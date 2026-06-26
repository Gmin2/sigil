export const DEPLOYER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

// official sBTC token; deployed and auto-funded on devnet by clarinet.
export const SBTC_DEPLOYER = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4";
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
