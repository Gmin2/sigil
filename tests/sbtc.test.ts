import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";
import { commitHash as sharedCommitHash } from "../shared/intent.ts";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const maker = accounts.get("wallet_1")!;
const solver = accounts.get("wallet_2")!;

const SBTC = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";
const SBTC_DEPLOYER = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4";
const usda = `${deployer}.mock-usda`;

const saltHex = "0x" + "07".repeat(32);
const salt = Buffer.from(saltHex.slice(2), "hex");

function commit(minOut: bigint, recipient: string): Uint8Array {
  const hex = sharedCommitHash({ tokenOut: usda, minOut: minOut.toString(), recipient, salt: saltHex });
  return new Uint8Array(Buffer.from(hex.slice(2), "hex"));
}

function sbtcBalance(who: string): bigint {
  const r = simnet.callReadOnlyFn(SBTC, "get-balance", [Cl.principal(who)], who);
  // (ok uint)
  return BigInt((r.result as any).value.value);
}

const amountIn = 1_00000000n; // 1 sBTC (8 decimals)

beforeEach(() => {
  // sBTC is auto-funded by clarinet in simnet; only the output token needs minting
  simnet.callPublicFn("mock-usda", "faucet", [Cl.uint(100_000000)], solver);
});

describe("intent-verifier with real sBTC", () => {
  it("escrows real sBTC and settles output to the maker", () => {
    const minOut = 50_000000n;
    const amountOut = 55_000000n;
    const expiry = simnet.blockHeight + 100;

    const makerSbtc0 = sbtcBalance(maker);
    const solverSbtc0 = sbtcBalance(solver);
    expect(makerSbtc0).toBeGreaterThanOrEqual(amountIn);

    const create = simnet.callPublicFn(
      "intent-verifier",
      "create-intent",
      [Cl.uint(1), Cl.contractPrincipal(SBTC_DEPLOYER, "sbtc-token"), Cl.uint(amountIn), Cl.buffer(commit(minOut, maker)), Cl.uint(expiry)],
      maker,
    );
    expect(create.result).toBeOk(Cl.bool(true));
    expect(sbtcBalance(maker)).toBe(makerSbtc0 - amountIn);

    const fill = simnet.callPublicFn(
      "intent-verifier",
      "fill-intent",
      [
        Cl.uint(1),
        Cl.contractPrincipal(SBTC_DEPLOYER, "sbtc-token"),
        Cl.contractPrincipal(deployer, "mock-usda"),
        Cl.uint(amountOut),
        Cl.uint(minOut),
        Cl.principal(maker),
        Cl.buffer(salt),
      ],
      solver,
    );
    expect(fill.result).toBeOk(Cl.bool(true));

    // solver received the escrowed real sBTC; maker received the USDA output
    expect(sbtcBalance(solver)).toBe(solverSbtc0 + amountIn);
    expect(simnet.getAssetsMap().get(".mock-usda.usda")?.get(maker)).toBe(55_000000n);
  });
});
