import type { Intent, Token } from "./types";

// devnet-style principals (match shared/chain.ts wallet roles)
const MAKER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const SOLVER_A = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";
const SOLVER_B = "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC";
const SOLVER_C = "STNHKEPYEPJ8ML9HWEYK71NFRW92CRGJ6QHTQ8WM";

export const TOKENS: Record<string, Token> = {
  sbtc: { symbol: "sBTC", contract: `${MAKER}.mock-sbtc`, decimals: 8 },
  usda: { symbol: "USDA", contract: `${MAKER}.mock-usda`, decimals: 6 },
};

// a base time so timestamps render deterministically (no Date.now in module scope)
const T0 = 1_750_000_000_000;

export const solverLabels: Record<string, string> = {
  [SOLVER_A]: "solver-a",
  [SOLVER_B]: "solver-b",
  [SOLVER_C]: "solver-c",
};

// what the public mempool exposes — only commit + escrow size, never the order.
// each intent also carries the local-only reveal/auction we'd know as maker/watcher.
export const mockIntents: Intent[] = [
  {
    id: 7,
    tokenIn: TOKENS.sbtc.contract,
    amountIn: "5000000", // 0.05 sBTC
    expiry: 168420,
    commit: "0x9f2c41ab83de77104c2b9a0e15d6f8c3a7be21490d5fa6c8b3e7102d4498ff61",
    maker: MAKER,
    status: "open",
    createdAt: T0 - 18_000,
    step: "bidding",
    reveal: {
      tokenOut: TOKENS.usda.contract,
      minOut: "4850000000", // 4,850 USDA
      recipient: MAKER,
      salt: "0x" + "a3".repeat(32),
    },
    auction: {
      status: "bidding",
      windowMs: 4000,
      firstBidAt: T0 - 2200,
      bids: [
        { solver: SOLVER_A, commit: "0x4d1e…", amountOut: "4902000000", state: "revealed" },
        { solver: SOLVER_B, commit: "0xb70a…", state: "committed" },
        { solver: SOLVER_C, commit: "0x1c8f…", state: "committed" },
      ],
    },
  },
  {
    id: 6,
    tokenIn: TOKENS.sbtc.contract,
    amountIn: "12000000", // 0.12 sBTC
    expiry: 168390,
    commit: "0x2a7d09e4cb118f63a05d7e29bb4c016f8d3e5a92704fc1b8ee6390ad7712cc04",
    maker: MAKER,
    status: "open",
    createdAt: T0 - 64_000,
    step: "committed",
  },
  {
    id: 5,
    tokenIn: TOKENS.sbtc.contract,
    amountIn: "2500000", // 0.025 sBTC
    expiry: 168200,
    commit: "0x77be3f12d0a4c98e51b6072aa3fd1ce8049b27e6135ca80df9217e4b6c0a5512",
    maker: MAKER,
    status: "filled",
    createdAt: T0 - 240_000,
    step: "filled",
    reveal: {
      tokenOut: TOKENS.usda.contract,
      minOut: "2410000000",
      recipient: MAKER,
      salt: "0x" + "5e".repeat(32),
    },
    auction: {
      status: "closed",
      windowMs: 4000,
      firstBidAt: T0 - 236_000,
      winner: SOLVER_B,
      amountOut: "2447500000",
      bids: [
        { solver: SOLVER_A, commit: "0x90fa…", amountOut: "2431000000", state: "revealed" },
        { solver: SOLVER_B, commit: "0x12cd…", amountOut: "2447500000", state: "revealed" },
      ],
    },
  },
  {
    id: 4,
    tokenIn: TOKENS.sbtc.contract,
    amountIn: "800000", // 0.008 sBTC
    expiry: 167990,
    commit: "0x55aa01bd7e3c9f204816ad0e7bb52c9f31806e4a2dd7901cf64b3e5128990aaf",
    maker: MAKER,
    status: "cancelled",
    createdAt: T0 - 600_000,
    step: "committed",
  },
];

// network-level mock stats for the landing
export const mockStats = {
  escrowed: "3.84", // sBTC currently in escrow
  intentsFilled: 1247,
  solversOnline: 6,
  medianFillMs: 5200,
};

export function tokenByContract(contract: string): Token {
  return (
    Object.values(TOKENS).find((t) => t.contract === contract) ?? {
      symbol: contract.split(".")[1] ?? "?",
      contract,
      decimals: 8,
    }
  );
}
