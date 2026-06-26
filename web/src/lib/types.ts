// mirrors obscura/shared/intent.ts so wiring the real relay/chain in later is a
// drop-in. amounts are uint strings (base units) exactly like on-chain.

export type IntentStatus = "open" | "filled" | "cancelled";

export type Token = {
  symbol: string;
  // "ADDR.contract" on-chain principal
  contract: string;
  decimals: number;
};

// what an observer sees on-chain: only the commitment + escrow size, never the order
export type PublicIntent = {
  id: number;
  tokenIn: string; // contract principal
  amountIn: string; // uint string, base units
  expiry: number; // block height
  commit: string; // 0x sha256
  maker: string; // principal
  status: IntentStatus;
  createdAt: number; // ms epoch
};

// the sealed order — only the maker and the winning solver ever learn it
export type Reveal = {
  tokenOut: string;
  minOut: string;
  recipient: string;
  salt: string;
};

export type BidState = "committed" | "revealed";

export type Bid = {
  solver: string; // short label / pubkey
  commit: string; // sha256(amountOut:salt)
  amountOut?: string; // only after reveal
  state: BidState;
};

export type AuctionStatus = "no-bids" | "bidding" | "closed";

export type Auction = {
  status: AuctionStatus;
  windowMs: number;
  firstBidAt?: number;
  bids: Bid[];
  winner?: string;
  amountOut?: string;
};

export type LifecycleStep =
  | "committed"
  | "escrowed"
  | "bidding"
  | "revealed"
  | "filled";

// the full local view we hold in the frontend: public fields + (optionally) the
// reveal we know, + the auction we're watching.
export type Intent = PublicIntent & {
  reveal?: Reveal; // present when we are the maker
  auction?: Auction;
  step: LifecycleStep;
};
