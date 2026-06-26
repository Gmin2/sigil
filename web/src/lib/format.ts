// base-unit uint string -> human amount. sBTC has 8 decimals like BTC.
export function fmtAmount(base: string, decimals: number, maxFrac = 6): string {
  const neg = base.startsWith("-");
  const digits = (neg ? base.slice(1) : base).padStart(decimals + 1, "0");
  const whole = digits.slice(0, digits.length - decimals);
  let frac = digits.slice(digits.length - decimals).replace(/0+$/, "");
  if (frac.length > maxFrac) frac = frac.slice(0, maxFrac);
  const w = Number(whole).toLocaleString("en-US");
  return (neg ? "-" : "") + (frac ? `${w}.${frac}` : w);
}

// shorten a principal or 0x hash for display: ST1PQ…GZGM
export function shorten(s: string, head = 6, tail = 4): string {
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

export function timeAgo(ms: number, now: number): string {
  const d = Math.max(0, now - ms);
  const s = Math.floor(d / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
