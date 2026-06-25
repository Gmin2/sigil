// Shared intent types and the commitment primitive. The commitHash logic here
// is the exact construction verified against intent-verifier.compute-commit in
// tests/intent.test.ts, so relay, solver, web, and contract all agree byte for
// byte. Do not change one without re-running that parity test.

import { Cl, serializeCV } from "@stacks/transactions";
import { createHash, randomBytes } from "node:crypto";

export type Intent = {
  id: number;
  // public, on-chain fields
  tokenIn: string; // "ADDR.contract"
  amountIn: string; // uint as string to avoid bigint json issues
  expiry: number;
  commit: string; // 0x-prefixed sha256 hex
  maker: string;
  // the reveal sealed (ECIES) to each registered solver pubkey. the relay never
  // sees plaintext; only a holder of the matching solver key can open its seal.
  seals: Record<string, string>; // solverPub -> base64 ciphertext
  status: "open" | "filled" | "cancelled";
  createdAt: number;
};

export type Reveal = {
  tokenOut: string; // "ADDR.contract"
  minOut: string; // uint as string
  recipient: string;
  salt: string; // 0x-prefixed 32-byte hex
};

export function newSalt(): string {
  return "0x" + randomBytes(32).toString("hex");
}

// sha256 over the consensus serialization of the revealed-params tuple,
// matching intent-verifier.compute-commit exactly.
export function commitHash(r: Reveal): string {
  const [addr, name] = r.tokenOut.split(".");
  const tuple = Cl.tuple({
    "min-out": Cl.uint(BigInt(r.minOut)),
    recipient: Cl.principal(r.recipient),
    salt: Cl.bufferFromHex(r.salt.replace(/^0x/, "")),
    "token-out": Cl.contractPrincipal(addr, name),
  });
  const bytes = Buffer.from(serializeCV(tuple), "hex");
  return "0x" + createHash("sha256").update(bytes).digest("hex");
}
