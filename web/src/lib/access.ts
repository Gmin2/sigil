// early-access gate. a promo code unlocks /app and is remembered in local
// storage. valid codes come from VITE_PROMO_CODES (comma separated); the
// default leaves one working code so early customers (and you) can get in.

const KEY = "sigil.access";

const VALID = new Set(
  (import.meta.env.VITE_PROMO_CODES ?? "sigil-early")
    .split(",")
    .map((c: string) => c.trim().toLowerCase())
    .filter(Boolean),
);

export function hasAccess(): boolean {
  return localStorage.getItem(KEY) === "granted";
}

export function redeem(code: string): boolean {
  if (VALID.has(code.trim().toLowerCase())) {
    localStorage.setItem(KEY, "granted");
    return true;
  }
  return false;
}
