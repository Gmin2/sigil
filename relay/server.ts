import express from "express";
import type { Intent } from "../shared/intent.ts";

const PORT = Number(process.env.PORT ?? 8788);

// crude in-memory mempool. swapped for something durable later.
const intents = new Map<number, Intent>();
// registered solver public keys (secp256k1 hex). makers seal reveals to these.
const solvers = new Set<string>();

function openIntents() {
  return [...intents.values()].filter((i) => i.status === "open");
}

// public view of an intent: the reveal stays hidden, observers see only the
// commitment and the escrow size.
function publicView(i: Intent) {
  return {
    id: i.id,
    tokenIn: i.tokenIn,
    amountIn: i.amountIn,
    expiry: i.expiry,
    commit: i.commit,
    maker: i.maker,
    status: i.status,
    createdAt: i.createdAt,
  };
}

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "obscura-relay", open: openIntents().length, solvers: solvers.size });
});

// solvers register the public key makers should seal reveals to.
app.post("/solvers", (req, res) => {
  const pub = String(req.body?.pub ?? "");
  if (!/^[0-9a-fA-F]{66,130}$/.test(pub)) return res.status(400).json({ error: "bad pubkey" });
  solvers.add(pub);
  res.json({ ok: true, solvers: solvers.size });
});

app.get("/solvers", (_req, res) => {
  res.json({ solvers: [...solvers] });
});

// maker posts an intent keyed by its on-chain id. the reveal arrives already
// sealed to each registered solver; the relay stores only ciphertext and the
// public commitment, never the plaintext order.
app.post("/intents", (req, res) => {
  const id = Number(req.body?.id);
  const seals = req.body?.seals;
  const commit = String(req.body?.commit ?? "");
  if (!Number.isFinite(id)) return res.status(400).json({ error: "missing on-chain id" });
  if (intents.has(id)) return res.status(409).json({ error: "id already posted" });
  if (!commit.startsWith("0x")) return res.status(400).json({ error: "missing commit" });
  if (!seals || typeof seals !== "object" || Object.keys(seals).length === 0) {
    return res.status(400).json({ error: "no sealed reveals" });
  }
  const intent: Intent = {
    id,
    tokenIn: req.body.tokenIn,
    amountIn: String(req.body.amountIn),
    expiry: Number(req.body.expiry),
    maker: req.body.maker,
    commit,
    seals,
    status: "open",
    createdAt: Date.now(),
  };
  intents.set(id, intent);
  res.json({ id, commit });
});

// solver reports it settled an intent on-chain so the relay stops offering it.
app.post("/intents/:id/filled", (req, res) => {
  const i = intents.get(Number(req.params.id));
  if (!i) return res.status(404).json({ error: "unknown intent" });
  i.status = "filled";
  res.json({ ok: true });
});

// public mempool: open intents, reveal hidden.
app.get("/intents", (_req, res) => {
  res.json({ intents: openIntents().map(publicView) });
});

// solver-facing: fetch the sealed reveal for a specific solver. the relay hands
// back only the ciphertext sealed to that solver's key; it cannot read it.
app.get("/intents/:id/reveal", (req, res) => {
  const i = intents.get(Number(req.params.id));
  if (!i || i.status !== "open") {
    return res.status(404).json({ error: "no open intent" });
  }
  const solver = String(req.query.solver ?? "");
  const seal = i.seals[solver];
  if (!seal) return res.status(404).json({ error: "no seal for this solver" });
  res.json({ id: i.id, tokenIn: i.tokenIn, amountIn: i.amountIn, commit: i.commit, seal });
});

app.listen(PORT, () => console.log(`relay listening on :${PORT}`));
