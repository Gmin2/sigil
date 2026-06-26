import { encrypt } from "eciesjs";

function toBase64(b: Uint8Array): string {
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s);
}

export function sealTo(pubHex: string, obj: unknown): string {
  const data = new TextEncoder().encode(JSON.stringify(obj));
  return toBase64(new Uint8Array(encrypt(pubHex, data)));
}
