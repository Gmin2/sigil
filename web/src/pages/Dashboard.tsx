import { useCallback, useState } from "react";
import { motion } from "motion/react";
import Nav from "../components/Nav";
import SwapCard from "../components/app/SwapCard";
import Mempool, { type Row } from "../components/app/Mempool";
import { Lock } from "../components/icons";
import { mockIntents, TOKENS } from "../lib/mock";
import { fmtAmount, shorten } from "../lib/format";
import { useWallet } from "../lib/wallet";

// lifecycle timing for a freshly sealed intent
const TIMING = { bidding: 1300, filled: 3400 };

const initialRows: Row[] = mockIntents.map((it) => ({
  id: it.id,
  sbtc: fmtAmount(it.amountIn, TOKENS.sbtc.decimals),
  commit: it.commit,
  expiry: it.expiry,
  status: it.status,
  fill: it.auction?.amountOut ? fmtAmount(it.auction.amountOut, TOKENS.usda.decimals) : undefined,
}));

export default function Dashboard() {
  const { address, connected, connect, disconnect } = useWallet();
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [nextId, setNextId] = useState(() => Math.max(...initialRows.map((r) => r.id)) + 1);
  const [amount, setAmount] = useState({ sbtc: 0, usda: 0 });
  const [sealing, setSealing] = useState(false);

  const onAmount = useCallback((sbtc: number, usda: number) => setAmount({ sbtc, usda }), []);

  const setStatus = (id: number, status: Row["status"], fill?: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status, fill: fill ?? r.fill, isNew: false } : r)));

  const seal = () => {
    if (!connected || amount.sbtc <= 0 || sealing) return;
    setSealing(true);
    const id = nextId;
    setNextId(id + 1);
    const usda = amount.usda;
    const row: Row = {
      id,
      sbtc: trim(amount.sbtc),
      commit: genCommit(`${id}:${amount.sbtc}:${usda}`),
      expiry: 168500 + id,
      status: "open",
      isNew: true,
    };
    setRows((prev) => [row, ...prev]);
    setTimeout(() => setStatus(id, "bidding"), TIMING.bidding);
    setTimeout(() => {
      setStatus(id, "filled", fmtUsda(usda * 1.012));
      setSealing(false);
    }, TIMING.filled);
  };

  return (
    <div className="min-h-screen bg-white text-ink">
      <Nav announcement={false} right={<ConnectButton address={address} onConnect={connect} onDisconnect={disconnect} />} />

      <main className="mx-auto max-w-[520px] px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="font-sans text-[32px] font-normal tracking-[-1.2px] text-ink">Trade privately</h1>
          <p className="mt-1 font-text text-[15px] text-muted">
            Compose an intent, seal it, and watch solvers fill it.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          <div>
          <SwapCard onAmount={onAmount} />

          <button
            onClick={connected ? seal : connect}
            disabled={connected && (amount.sbtc <= 0 || sealing)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-sans text-[16px] font-medium text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {!connected ? (
              "Connect wallet to seal"
            ) : sealing ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> sealing…
              </motion.span>
            ) : amount.sbtc <= 0 ? (
              "Enter an amount"
            ) : (
              <>
                <Lock className="h-4 w-4" /> Seal &amp; escrow
              </>
            )}
          </button>
          <p className="mt-2 text-center font-mono text-[11px] text-faint">
            only the commitment goes on-chain
          </p>
        </div>

          <Mempool rows={rows} />
        </div>
      </main>
    </div>
  );
}

function ConnectButton({
  address,
  onConnect,
  onDisconnect,
}: {
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return address ? (
    <button
      onClick={onDisconnect}
      title="Disconnect"
      className="flex items-center gap-2 rounded-full border border-border px-3.5 py-2 font-mono text-[13px] text-ink"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-sealed" />
      {shorten(address)}
    </button>
  ) : (
    <button
      onClick={onConnect}
      className="rounded-full bg-accent px-4 py-2 font-sans text-[14px] font-medium text-white transition-colors hover:bg-accent-600"
    >
      Connect wallet
    </button>
  );
}

function trim(n: number): string {
  return parseFloat(n.toFixed(8)).toString();
}

function fmtUsda(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// deterministic fake commitment (display only, not crypto)
function genCommit(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const a = (h >>> 0).toString(16).padStart(8, "0");
  const b = (Math.imul(h ^ 0x9e3779b9, 2654435761) >>> 0).toString(16).padStart(8, "0");
  return `0x${a}${b.slice(0, 4)}…${b.slice(4)}`;
}
