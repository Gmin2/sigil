import express from "express";
import { commitHash, type Intent, type Reveal } from "../shared/intent.ts";

const PORT = Number(process.env.PORT ?? 8788);

// crude in-memory mempool. swapped for something durable later.
const intents = new Map<number, Intent>();
let nextId = 1;

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
  res.json({ ok: true, service: "obscura-relay", open: openIntents().length });
});

// maker posts an intent. relay derives the commitment from the reveal and hands
// back the commit so the maker can escrow on-chain with the same hash.
app.post("/intents", (req, res) => {
  const reveal: Reveal = req.body?.reveal;
  if (!reveal?.tokenOut || !reveal?.minOut || !reveal?.recipient || !reveal?.salt) {
    return res.status(400).json({ error: "missing reveal fields" });
  }
  const id = nextId++;
  const intent: Intent = {
    id,
    tokenIn: req.body.tokenIn,
    amountIn: String(req.body.amountIn),
    expiry: Number(req.body.expiry),
    maker: req.body.maker,
    commit: commitHash(reveal),
    reveal,
    status: "open",
    createdAt: Date.now(),
  };
  intents.set(id, intent);
  res.json({ id, commit: intent.commit });
});

// public mempool: open intents, reveal hidden.
app.get("/intents", (_req, res) => {
  res.json({ intents: openIntents().map(publicView) });
});

// solver-facing: fetch the reveal for an intent so a solver can price it. crude
// and unauthenticated for now; later this is encrypted to registered solver keys
// so only they can decrypt.
app.get("/intents/:id/reveal", (req, res) => {
  const i = intents.get(Number(req.params.id));
  if (!i || i.status !== "open") {
    return res.status(404).json({ error: "no open intent" });
  }
  res.json({ id: i.id, tokenIn: i.tokenIn, amountIn: i.amountIn, reveal: i.reveal });
});

app.listen(PORT, () => console.log(`relay listening on :${PORT}`));
