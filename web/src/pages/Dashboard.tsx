import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Nav from "../components/Nav";
import SwapCard from "../components/app/SwapCard";
import Mempool, { type Row } from "../components/app/Mempool";
import { Lock, ArrowRight } from "../components/icons";
import { AnimatedLogo } from "../components/AnimatedLogo";
import { SbtcLogo, UsdaLogo } from "../components/tokens";
import { request } from "@stacks/connect";
import { Cl, Pc } from "@stacks/transactions";
import { TOKENS } from "../lib/mock";
import { fmtAmount, shorten } from "../lib/format";
import { useWallet } from "../lib/wallet";
import { commitHash, newSalt } from "../lib/intent";
import { getFeed, publishIntent, type FeedIntent } from "../lib/relay";
import { waitForEscrow, sbtcBalance } from "../lib/chain";
import { CONTRACTS, NETWORK, SBTC, SBTC_DEPLOYER, txUrl } from "../lib/config";

function toRow(f: FeedIntent): Row {
  const filled = f.status === "filled";
  const bidding = f.auction?.status === "bidding";
  return {
    id: f.id,
    sbtc: fmtAmount(f.amountIn, TOKENS.sbtc.decimals),
    commit: short0x(f.commit),
    expiry: f.expiry,
    status: filled ? "filled" : bidding ? "bidding" : "open",
    fill: f.auction?.amountOut ? fmtAmount(f.auction.amountOut, TOKENS.usda.decimals) : undefined,
  };
}

export default function Dashboard() {
  const { address, connected, connect, disconnect } = useWallet();
  const [feed, setFeed] = useState<FeedIntent[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [amount, setAmount] = useState({ sbtc: 0, usda: 0 });
  const [sealing, setSealing] = useState(false);
  const [sbtcBal, setSbtcBal] = useState<number | undefined>();

  const rows = feed.map(toRow);
  const selected = feed.find((f) => f.id === selectedId) ?? null;

  const onAmount = useCallback((sbtc: number, usda: number) => setAmount({ sbtc, usda }), []);

  // load the wallet's real sBTC balance (sats -> sBTC) when connected
  useEffect(() => {
    if (!address) return setSbtcBal(undefined);
    let live = true;
    sbtcBalance(address)
      .then((b) => live && setSbtcBal(Number(b) / 1e8))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [address]);

  const refresh = useCallback(async () => {
    try {
      const f = await getFeed();
      f.sort((a, b) => b.createdAt - a.createdAt);
      setFeed(f);
    } catch {
      // relay not running yet; leave feed as-is
    }
  }, []);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 2000);
    return () => clearInterval(iv);
  }, [refresh]);

  const seal = async () => {
    if (!connected || !address || amount.sbtc <= 0 || sealing) return;
    setSealing(true);
    try {
      const id = Math.floor(Math.random() * 1_000_000);
      const amountIn = BigInt(Math.round(amount.sbtc * 1e8));
      const minOut = BigInt(Math.round(amount.usda * 1e6));
      const reveal = { tokenOut: CONTRACTS.usda, minOut: String(minOut), recipient: address, salt: newSalt() };
      const commit = await commitHash(reveal);

      const res = await request("stx_callContract", {
        contract: CONTRACTS.verifier as `${string}.${string}`,
        functionName: "create-intent",
        functionArgs: [
          Cl.uint(id),
          Cl.contractPrincipal(SBTC_DEPLOYER, "sbtc-token"),
          Cl.uint(amountIn),
          Cl.bufferFromHex(commit.replace(/^0x/, "")),
          Cl.uint(1_000_000),
        ],
        // the maker sends exactly amountIn sBTC into escrow; nothing more
        postConditionMode: "deny",
        postConditions: [Pc.principal(address).willSendEq(amountIn).ft(SBTC as `${string}.${string}`, "sbtc-token")],
        network: NETWORK,
      });

      // publish the sealed intent so solvers can find and fill it
      await publishIntent({
        id,
        tokenIn: SBTC,
        amountIn: String(amountIn),
        expiry: 1_000_000,
        maker: address,
        commit,
        reveal,
        createTxid: res.txid,
      }).catch((e) => console.warn("relay publish failed (intent still escrowed on-chain):", e));

      console.log("create-intent tx:", res.txid);
      // keep the button loading until the escrow is actually confirmed on-chain
      await waitForEscrow(id);
      await refresh();
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
          <SwapCard onAmount={onAmount} sbtcBalance={sbtcBal} />

          <button
            onClick={connected ? seal : connect}
            disabled={connected && (amount.sbtc <= 0 || sealing)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-sans text-[16px] font-medium text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {!connected ? (
              "Connect wallet to seal"
            ) : sealing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                sealing…
              </span>
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

          <Mempool rows={rows} onRowClick={setSelectedId} />
        </div>
      </main>

      <AnimatePresence>
        {selected && <IntentModal key={selected.id} intent={selected} onClose={() => setSelectedId(null)} />}
      </AnimatePresence>
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

function short0x(hex: string): string {
  const h = hex.replace(/^0x/, "");
  return `0x${h.slice(0, 8)}…${h.slice(-8)}`;
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.12 + i * 0.05, duration: 0.35, ease: [0.44, 0, 0.56, 1] as const },
});

function IntentModal({ intent, onClose }: { intent: FeedIntent; onClose: () => void }) {
  const fill = intent.auction?.amountOut;
  const amountIn = fmtAmount(intent.amountIn, TOKENS.sbtc.decimals);
  const filledFor = fill ? fmtAmount(fill, TOKENS.usda.decimals) : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-[460px] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-border"
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="relative flex items-center gap-2.5 bg-accent-wash px-6 py-5">
          <AnimatedLogo className="h-6 w-6 text-accent" />
          <span className="font-sans text-[17px] font-medium tracking-[-0.3px]">Intent #{intent.id}</span>
          <div className="ml-auto">
            <ModalStatus status={intent.status} />
          </div>
          <button
            onClick={onClose}
            className="absolute -right-0 top-0 m-3 flex h-7 w-7 items-center justify-center rounded-full text-faint transition-colors hover:bg-white hover:text-ink"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        {/* settlement summary */}
        <motion.div {...stagger(0)} className="flex items-center justify-between gap-2 px-6 pt-6">
          <TokenAmt logo={<SbtcLogo className="h-7 w-7" />} amount={amountIn} sym="sBTC" label="escrowed" />
          <ArrowRight className="h-4 w-4 shrink-0 text-faint" />
          <TokenAmt
            logo={<UsdaLogo className="h-7 w-7" />}
            amount={filledFor ?? "sealed"}
            sym={filledFor ? "USDA" : ""}
            label={filledFor ? "delivered" : "min out hidden"}
            align="right"
          />
        </motion.div>

        {/* sealed commitment */}
        <motion.div {...stagger(1)} className="px-6 pt-5">
          <div className="rounded-2xl border border-border-200 bg-surface-100 p-3.5">
            <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] text-muted">
              <Lock className="h-3.5 w-3.5 text-accent" /> sealed commitment
            </div>
            <div className="break-all font-doto text-[12px] leading-[1.5] text-accent">{intent.commit}</div>
          </div>
        </motion.div>

        {/* details */}
        <motion.div {...stagger(2)} className="space-y-1 px-6 pb-2 pt-4">
          <DetailRow label="Maker">
            <span className="font-mono text-[13px]">{shorten(intent.maker)}</span>
          </DetailRow>
          {intent.createTxid && <TxRow label="Escrow tx" txid={intent.createTxid} />}
          {intent.fillTxid && <TxRow label="Fill tx" txid={intent.fillTxid} />}
        </motion.div>

        {/* footer */}
        <div className="mt-3 border-t border-border px-6 py-3 font-mono text-[11px] leading-[1.5] text-faint">
          the order — output token, price, recipient — never goes on-chain. only the commitment is public.
        </div>
      </motion.div>
    </motion.div>
  );
}

function TokenAmt({
  logo,
  amount,
  sym,
  label,
  align = "left",
}: {
  logo: React.ReactNode;
  amount: string;
  sym: string;
  label: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${align === "right" ? "items-end text-right" : "items-start"}`}>
      <div className="flex items-center gap-2">
        {align === "left" && logo}
        <span className="truncate font-sans text-[18px] font-semibold tracking-tight text-ink">
          {amount} {sym}
        </span>
        {align === "right" && logo}
      </div>
      <span className="font-mono text-[11px] text-faint">{label}</span>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="shrink-0 font-sans text-[13px] text-muted">{label}</span>
      <span className="text-right text-ink">{children}</span>
    </div>
  );
}

function ModalStatus({ status }: { status: FeedIntent["status"] }) {
  const cls =
    status === "filled"
      ? "bg-[#e7f6ee] text-sealed"
      : status === "cancelled"
        ? "bg-surface-200 text-muted"
        : "bg-white text-accent";
  return <span className={`rounded-full px-2.5 py-1 font-mono text-[11px] ${cls}`}>{status}</span>;
}

function TxRow({ label, txid }: { label: string; txid: string }) {
  return (
    <a
      href={txUrl(txid)}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-4 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-100"
    >
      <span className="shrink-0 font-sans text-[13px] text-muted">{label}</span>
      <span className="flex items-center gap-1 font-mono text-[12px] text-accent group-hover:underline">
        {short0x(txid)}
        <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
      </span>
    </a>
  );
}
