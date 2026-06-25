// commitHash must stay in sync with intent-verifier.compute-commit; the parity
// is pinned by tests/intent.test.ts.

import { Cl, serializeCV } from "@stacks/transactions";
import { createHash, randomBytes } from "node:crypto";

export type Intent = {
  id: number;
  tokenIn: string;
  amountIn: string;
  expiry: number;
  commit: string;
  maker: string;
  // reveal sealed to each solver pubkey; the relay only ever holds ciphertext
  seals: Record<string, string>;
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
