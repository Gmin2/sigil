import { Cl, serializeCV } from "@stacks/transactions";

export type Reveal = {
  tokenOut: string;
  minOut: string;
  recipient: string;
  salt: string;
};

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  const h = hex.replace(/^0x/, "");
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function newSalt(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return "0x" + toHex(b);
}

// must match intent-verifier.compute-commit: sha256 over the consensus
// serialization of the revealed params tuple.
export async function commitHash(r: Reveal): Promise<string> {
  const [addr, name] = r.tokenOut.split(".");
  const tuple = Cl.tuple({
    "min-out": Cl.uint(BigInt(r.minOut)),
    recipient: Cl.principal(r.recipient),
    salt: Cl.bufferFromHex(r.salt.replace(/^0x/, "")),
    "token-out": Cl.contractPrincipal(addr, name),
  });
  const bytes = fromHex(serializeCV(tuple));
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return "0x" + toHex(new Uint8Array(digest));
}
