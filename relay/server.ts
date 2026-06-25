import { createServer, type IncomingMessage } from "node:http";
import { commitHash, type Intent, type Reveal } from "../shared/intent.ts";

const PORT = Number(process.env.PORT ?? 8787);

// crude in-memory mempool. swapped for something durable later.
const intents = new Map<number, Intent>();
let nextId = 1;

function openCount() {
  return [...intents.values()].filter((i) => i.status === "open").length;
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

function readJson(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = createServer(async (req, res) => {
  res.setHeader("content-type", "application/json");
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  try {
    if (req.method === "GET" && url.pathname === "/health") {
      return res.end(JSON.stringify({ ok: true, service: "obscura-relay", open: openCount() }));
    }

    // maker posts an intent. relay derives the commitment from the reveal and
    // hands back the commit so the maker can escrow on-chain with the same hash.
    if (req.method === "POST" && url.pathname === "/intents") {
      const body = await readJson(req);
      const reveal: Reveal = body.reveal;
      if (!reveal?.tokenOut || !reveal?.minOut || !reveal?.recipient || !reveal?.salt) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "missing reveal fields" }));
      }
      const id = nextId++;
      const intent: Intent = {
        id,
        tokenIn: body.tokenIn,
        amountIn: String(body.amountIn),
        expiry: Number(body.expiry),
        maker: body.maker,
        commit: commitHash(reveal),
        reveal,
        status: "open",
        createdAt: Date.now(),
      };
      intents.set(id, intent);
      return res.end(JSON.stringify({ id, commit: intent.commit }));
    }

    // public mempool: open intents, reveal hidden.
    if (req.method === "GET" && url.pathname === "/intents") {
      const open = [...intents.values()].filter((i) => i.status === "open").map(publicView);
      return res.end(JSON.stringify({ intents: open }));
    }

    // solver-facing: fetch the reveal for an intent so a solver can price it.
    // crude and unauthenticated for now; later this is encrypted to registered
    // solver keys so only they can decrypt.
    const revealMatch = url.pathname.match(/^\/intents\/(\d+)\/reveal$/);
    if (req.method === "GET" && revealMatch) {
      const i = intents.get(Number(revealMatch[1]));
      if (!i || i.status !== "open") {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: "no open intent" }));
      }
      return res.end(JSON.stringify({ id: i.id, tokenIn: i.tokenIn, amountIn: i.amountIn, reveal: i.reveal }));
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "not found" }));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(e) }));
  }
});

server.listen(PORT, () => console.log(`relay listening on :${PORT}`));
