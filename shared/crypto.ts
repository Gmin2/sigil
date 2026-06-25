// ECIES (secp256k1) used to seal an intent reveal to solver pubkeys.

import { encrypt, decrypt, PrivateKey } from "eciesjs";

export type SolverKey = { priv: string; pub: string };

export function genSolverKey(): SolverKey {
  const sk = new PrivateKey();
  return { priv: sk.toHex(), pub: sk.publicKey.toHex() };
}

export function sealTo(pubHex: string, obj: unknown): string {
  const ct = encrypt(pubHex, Buffer.from(JSON.stringify(obj)));
  return Buffer.from(ct).toString("base64");
}

export function open<T>(privHex: string, b64: string): T {
  const pt = decrypt(privHex, Buffer.from(b64, "base64"));
  return JSON.parse(Buffer.from(pt).toString("utf8")) as T;
}
