// ECIES over secp256k1 (ephemeral ECDH + AES-GCM, via eciesjs). Used to seal an
// intent's reveal to registered solver public keys so the relay only ever holds
// ciphertext and only a holder of the matching solver private key can read it.

import { encrypt, decrypt, PrivateKey } from "eciesjs";

export type SolverKey = { priv: string; pub: string };

export function genSolverKey(): SolverKey {
  const sk = new PrivateKey();
  return { priv: sk.toHex(), pub: sk.publicKey.toHex() };
}

// seal an object to a solver public key, return base64 ciphertext.
export function sealTo(pubHex: string, obj: unknown): string {
  const ct = encrypt(pubHex, Buffer.from(JSON.stringify(obj)));
  return Buffer.from(ct).toString("base64");
}

// open base64 ciphertext with a solver private key.
export function open<T>(privHex: string, b64: string): T {
  const pt = decrypt(privHex, Buffer.from(b64, "base64"));
  return JSON.parse(Buffer.from(pt).toString("utf8")) as T;
}
