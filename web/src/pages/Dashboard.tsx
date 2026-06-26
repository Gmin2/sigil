import { useCallback, useState } from "react";
import { motion } from "motion/react";
import Nav from "../components/Nav";
import SwapCard from "../components/app/SwapCard";
import Mempool, { type Row } from "../components/app/Mempool";
import { Lock } from "../components/icons";
import { request } from "@stacks/connect";
import { Cl } from "@stacks/transactions";
import { mockIntents, TOKENS } from "../lib/mock";
import { fmtAmount, shorten } from "../lib/format";
import { useWallet } from "../lib/wallet";
import { commitHash, newSalt } from "../lib/intent";
import { CONTRACTS, DEPLOYER, NETWORK } from "../lib/config";

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
  const [amount, setAmount] = useState({ sbtc: 0, usda: 0 });
  const [sealing, setSealing] = useState(false);

  const onAmount = useCallback((sbtc: number, usda: number) => setAmount({ sbtc, usda }), []);

  const seal = async () => {
    if (!connected || !address || amount.sbtc <= 0 || sealing) return;
    setSealing(true);
    try {
      const id = Math.floor(Math.random() * 1_000_000_000);
      const amountIn = BigInt(Math.round(amount.sbtc * 1e8));
      const minOut = BigInt(Math.round(amount.usda * 1e6));
      const reveal = { tokenOut: CONTRACTS.usda, minOut: String(minOut), recipient: address, salt: newSalt() };
      const commit = await commitHash(reveal);

      const res = await request("stx_callContract", {
        contract: CONTRACTS.verifier as `${string}.${string}`,
        functionName: "create-intent",
        functionArgs: [
          Cl.uint(id),
          Cl.contractPrincipal(DEPLOYER, "mock-sbtc"),
          Cl.uint(amountIn),
          Cl.bufferFromHex(commit.replace(/^0x/, "")),
          Cl.uint(1_000_000),
        ],
        network: NETWORK,
      });

      setRows((prev) => [
        { id, sbtc: trim(amount.sbtc), commit: short0x(commit), expiry: 1_000_000, status: "open", isNew: true, txid: res.txid },
        ...prev,
      ]);
    } catch (e) {
      console.error("seal failed", e);
    } finally {
      setSealing(false);
    }
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

function short0x(hex: string): string {
  const h = hex.replace(/^0x/, "");
  return `0x${h.slice(0, 8)}…${h.slice(-8)}`;
}
