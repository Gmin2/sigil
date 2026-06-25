import { describe, expect, it, beforeEach } from "vitest";
import { Cl, serializeCV } from "@stacks/transactions";
import { createHash } from "node:crypto";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const maker = accounts.get("wallet_1")!;
const solver = accounts.get("wallet_2")!;

const usda = `${deployer}.mock-usda`;

// Build the commitment exactly as intent-verifier.compute-commit does:
// sha256 over the consensus serialization of the revealed params tuple.
function commitHash(opts: {
  tokenOut: string;
  minOut: bigint;
  recipient: string;
  salt: Uint8Array;
}): Uint8Array {
  const [addr, name] = opts.tokenOut.split(".");
  const tuple = Cl.tuple({
    "min-out": Cl.uint(opts.minOut),
    recipient: Cl.principal(opts.recipient),
    salt: Cl.buffer(opts.salt),
    "token-out": Cl.contractPrincipal(addr, name),
  });
  const hex = serializeCV(tuple);
  const bytes = Buffer.from(hex, "hex");
  return new Uint8Array(createHash("sha256").update(bytes).digest());
}

const salt = new Uint8Array(32).fill(7);

beforeEach(() => {
  simnet.callPublicFn("mock-sbtc", "faucet", [Cl.uint(2_00000000)], maker);
  simnet.callPublicFn("mock-usda", "faucet", [Cl.uint(100_000000)], solver);
});

describe("commitment hashing", () => {
  it("client hash matches the contract's compute-commit", () => {
    const minOut = 50_000000n;
    const local = commitHash({ tokenOut: usda, minOut, recipient: maker, salt });
    const onchain = simnet.callReadOnlyFn(
      "intent-verifier",
      "compute-commit",
      [Cl.contractPrincipal(deployer, "mock-usda"), Cl.uint(minOut), Cl.principal(maker), Cl.buffer(salt)],
      deployer,
    );
    expect(onchain.result).toBeBuff(local);
  });
});

describe("happy path: create then fill", () => {
  it("escrows, settles output to maker and escrow to solver", () => {
    const amountIn = 1_00000000n; // 1 sBTC
    const minOut = 50_000000n; // 50 USDA
    const amountOut = 55_000000n; // solver fills above min
    const expiry = simnet.blockHeight + 100;
    const commit = commitHash({ tokenOut: usda, minOut, recipient: maker, salt });

    const create = simnet.callPublicFn(
      "intent-verifier",
      "create-intent",
      [Cl.uint(1), Cl.contractPrincipal(deployer, "mock-sbtc"), Cl.uint(amountIn), Cl.buffer(commit), Cl.uint(expiry)],
      maker,
    );
    expect(create.result).toBeOk(Cl.bool(true));
    // escrow left the maker
    expect(simnet.getAssetsMap().get(".mock-sbtc.sbtc")?.get(maker)).toBe(1_00000000n);

    const fill = simnet.callPublicFn(
      "intent-verifier",
      "fill-intent",
      [
        Cl.uint(1),
        Cl.contractPrincipal(deployer, "mock-sbtc"),
        Cl.contractPrincipal(deployer, "mock-usda"),
        Cl.uint(amountOut),
        Cl.uint(minOut),
        Cl.principal(maker),
        Cl.buffer(salt),
      ],
      solver,
    );
    expect(fill.result).toBeOk(Cl.bool(true));

    const sbtcMap = simnet.getAssetsMap().get(".mock-sbtc.sbtc")!;
    const usdaMap = simnet.getAssetsMap().get(".mock-usda.usda")!;
    // solver received the escrowed sBTC
    expect(sbtcMap.get(solver)).toBe(1_00000000n);
    // maker received the USDA output
    expect(usdaMap.get(maker)).toBe(55_000000n);
  });
});

describe("security checks", () => {
  it("rejects a fill whose reveal does not match the commitment", () => {
    const expiry = simnet.blockHeight + 100;
    const commit = commitHash({ tokenOut: usda, minOut: 50_000000n, recipient: maker, salt });
    simnet.callPublicFn(
      "intent-verifier",
      "create-intent",
      [Cl.uint(2), Cl.contractPrincipal(deployer, "mock-sbtc"), Cl.uint(1_00000000), Cl.buffer(commit), Cl.uint(expiry)],
      maker,
    );
    // solver lies about min-out (reveals 10 instead of committed 50)
    const fill = simnet.callPublicFn(
      "intent-verifier",
      "fill-intent",
      [
        Cl.uint(2),
        Cl.contractPrincipal(deployer, "mock-sbtc"),
        Cl.contractPrincipal(deployer, "mock-usda"),
        Cl.uint(20_000000),
        Cl.uint(10_000000),
        Cl.principal(maker),
        Cl.buffer(salt),
      ],
      solver,
    );
    expect(fill.result).toBeErr(Cl.uint(206)); // ERR-COMMIT-MISMATCH
  });

  it("rejects a fill that delivers less than min-out", () => {
    const expiry = simnet.blockHeight + 100;
    const minOut = 50_000000n;
    const commit = commitHash({ tokenOut: usda, minOut, recipient: maker, salt });
    simnet.callPublicFn(
      "intent-verifier",
      "create-intent",
      [Cl.uint(3), Cl.contractPrincipal(deployer, "mock-sbtc"), Cl.uint(1_00000000), Cl.buffer(commit), Cl.uint(expiry)],
      maker,
    );
    const fill = simnet.callPublicFn(
      "intent-verifier",
      "fill-intent",
      [
        Cl.uint(3),
        Cl.contractPrincipal(deployer, "mock-sbtc"),
        Cl.contractPrincipal(deployer, "mock-usda"),
        Cl.uint(40_000000), // below the committed min-out of 50
        Cl.uint(minOut),
        Cl.principal(maker),
        Cl.buffer(salt),
      ],
      solver,
    );
    expect(fill.result).toBeErr(Cl.uint(207)); // ERR-MIN-OUT
  });

  it("lets the maker reclaim escrow after expiry", () => {
    const expiry = simnet.blockHeight + 5;
    const commit = commitHash({ tokenOut: usda, minOut: 50_000000n, recipient: maker, salt });
    simnet.callPublicFn(
      "intent-verifier",
      "create-intent",
      [Cl.uint(4), Cl.contractPrincipal(deployer, "mock-sbtc"), Cl.uint(1_00000000), Cl.buffer(commit), Cl.uint(expiry)],
      maker,
    );
    simnet.mineEmptyBlocks(10);
    const cancel = simnet.callPublicFn(
      "intent-verifier",
      "cancel-intent",
      [Cl.uint(4), Cl.contractPrincipal(deployer, "mock-sbtc")],
      maker,
    );
    expect(cancel.result).toBeOk(Cl.bool(true));
    // maker has the full 2 sBTC back (1 from faucet + 1 returned)
    expect(simnet.getAssetsMap().get(".mock-sbtc.sbtc")?.get(maker)).toBe(2_00000000n);
  });
});
