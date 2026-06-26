# Running the full demo (devnet)

Four shells plus the browser. The devnet must be started from a normal terminal
(a sandboxed shell cannot create the clarinet snapshot cache or reach
`host.docker.internal`, so the stacks-node fails to find the bitcoin node).

## 1. Chain

```sh
clarinet devnet start
```

Wait for the dashboard to show `stacks-node` mining. This deploys the official
`SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token` and auto-funds every
devnet wallet with sBTC, plus our `intent-verifier` and `mock-usda`.

## 2. Relay

```sh
node relay/server.ts
```

## 3. Solvers (one or two for a competitive auction)

```sh
SOLVER_WALLET=wallet_2 MARGIN=0       STACKS_NODE=http://localhost:20443 node solver/agent.ts
SOLVER_WALLET=wallet_3 MARGIN=5000000 STACKS_NODE=http://localhost:20443 node solver/agent.ts
```

## 4. Web

```sh
cd web && pnpm dev
```

## Wallet setup (Leather)

1. Switch Leather to its **Devnet** network (points at `http://localhost:3999`).
2. Import a devnet account using a mnemonic from `settings/Devnet.toml`
   (e.g. `wallet_1`). These are auto-funded with sBTC.

## Flow

Open `http://localhost:5173/app`, connect the wallet, enter an sBTC amount and a
USDA minimum, and hit **Seal & escrow**. The wallet signs `create-intent`
(escrowing real sBTC with a post-condition); the reveal is sealed to the running
solvers and posted to the relay; a solver wins the sealed-bid auction and calls
`fill-intent`; the mempool row flips to `filled`.

## CLI alternative (no browser)

With shells 1-3 running, simulate the maker from the command line:

```sh
RELAY=http://localhost:8788 STACKS_NODE=http://localhost:20443 ID=700001 node scripts/maker.ts
```
