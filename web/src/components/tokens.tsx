import { useState } from "react";

type Props = { className?: string };

// sBTC — Bitcoin-backed, so the real Bitcoin mark (orange + white ₿)
export function SbtcLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#F7931A" />
      <path
        d="M9 7.5h3.9c1.5 0 2.4.8 2.4 2 0 .9-.5 1.5-1.3 1.8.9.3 1.5 1 1.5 2 0 1.4-1 2.2-2.7 2.2H9V7.5Zm1.9 1.6v1.9h1.6c.6 0 1-.4 1-.95s-.4-.95-1-.95h-1.6Zm0 3.4v2h1.7c.7 0 1.1-.4 1.1-1s-.4-1-1.2-1h-1.6Z"
        fill="#fff"
      />
      <path d="M11 5.4v1.5M13 5.4v1.5M11 17.1v1.5M13 17.1v1.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// USDA — Arkadiko's Stacks stablecoin (green coin + $)
export function UsdaLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#26b67a" />
      <DollarGlyph />
    </svg>
  );
}

// STX — Stacks (purple coin + angle mark)
export function StxLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#5546FF" />
      <g stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M8 9 12 6.6 16 9" />
        <path d="M8 15 12 17.4 16 15" />
        <path d="M8.6 12h6.8" />
      </g>
    </svg>
  );
}

// USDC — USD Coin (blue coin + $)
export function UsdcLogo({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#2775CA" />
      <DollarGlyph />
    </svg>
  );
}

function DollarGlyph() {
  return (
    <text
      x="12"
      y="16.6"
      textAnchor="middle"
      fill="#fff"
      style={{ fontFamily: "baseSans, system-ui, sans-serif", fontSize: 14, fontWeight: 700 }}
    >
      $
    </text>
  );
}

export type Token = {
  symbol: string;
  name: string;
  Logo: (p: Props) => React.ReactElement; // inline fallback
  logoURI?: string; // real vendored asset (cryptocurrency-icons)
  price: number; // USD
  balance: number;
};

export const TOKEN_LIST: Token[] = [
  { symbol: "sBTC", name: "Bitcoin", Logo: SbtcLogo, logoURI: "/tokens/btc.svg", price: 97000, balance: 0.42 },
  { symbol: "STX", name: "Stacks", Logo: StxLogo, logoURI: "/tokens/stx.svg", price: 2.1, balance: 1240.5 },
  { symbol: "USDA", name: "Arkadiko USD", Logo: UsdaLogo, price: 1, balance: 5200 },
  { symbol: "USDC", name: "USD Coin", Logo: UsdcLogo, logoURI: "/tokens/usdc.svg", price: 1, balance: 3100 },
];

export const findToken = (symbol: string) => TOKEN_LIST.find((t) => t.symbol === symbol)!;

// renders the real asset image, falling back to the inline svg if it 404s
export function TokenImg({ token, className }: { token: Token; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (token.logoURI && !failed) {
    return (
      <img
        src={token.logoURI}
        alt={token.symbol}
        className={`rounded-full ${className ?? ""}`}
        onError={() => setFailed(true)}
      />
    );
  }
  const Logo = token.Logo;
  return <Logo className={className} />;
}
