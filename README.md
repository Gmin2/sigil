# Sigil

confidential trade intents on bitcoin, settled in sBTC.

instead of broadcasting a trade for everyone to see and frontrun, you sign an
intent and escrow your sBTC, and only a commitment hash goes on-chain. the actual
order, what you want, your limit, where it lands, stays sealed. solver agents
compete in a sealed-bid auction to fill it, and a Clarity contract releases the
escrow only if the winning fill matches your commitment.

intents protocols like NEAR let you say what you want instead of how to get it,
and solvers do the work. nobody had brought that to Bitcoin. Sigil does, with
privacy built in.

## how it works

1. you sign an intent (swap this much sBTC for at least this much of token Y
   before block N) and call create-intent, which escrows your sBTC and publishes
   only sha256 of the order.
2. the order goes to a relay that holds the mempool. the reveal is encrypted to
   the registered solvers, so the relay only ever sees ciphertext.
3. solvers decrypt, then bid in a sealed-bid auction. during the window nobody
   sees the bids, only commitments to them.
4. the best bid wins and the solver calls fill-intent. the contract recomputes
   the commitment from the revealed params, checks the delivered amount clears
   your minimum, and settles atomically: output to you, escrow to the solver.
5. if nobody fills it before expiry, you call cancel-intent and get your sBTC
   back.

settlement is real sBTC on Stacks, anchored to Bitcoin.

## privacy

three layers, in order of how much they hide:

- commit-reveal: the order is hidden on-chain until fill, so theres no public
  order to frontrun.
- sealed reveals: the order is encrypted (ECIES) to each registered solver, so
  even the relay operator cant read it.
- sealed-bid auction: solvers compete with hidden bids, so the matching itself
  is confidential and the maker gets a better price from the competition.

one honest constraint: Clarity has no zero-knowledge precompiles, so on-chain
shielded amounts (zcash style) arent possible. the confidentiality lives
off-chain, the same way NEAR does it with a private shard. a TEE or MPC solver
network is the production hardening of the auction, not built here.

## whats in here

- contracts/: the Clarity side. intent-verifier (create / fill / cancel with
  commit-reveal escrow), the sip-010 trait, and a mock USDA output token. the
  input token is the real sBTC contract.
- relay/: an express service holding the intent mempool, the solver registry,
  and the sealed-bid auction.
- solver/: an agent that decrypts intents sealed to its key, bids, and settles
  on-chain if it wins.
- shared/: the commit hashing primitive, the ECIES sealing, and the chain
  helpers, shared by the relay, solver, and frontend.
- web/: the Sigil app. wallet connect, build and sign an intent, watch the
  mempool fill live, click any intent to see its on-chain transactions.
- scripts/: a cli maker and an end to end driver for running without the
  browser.
- tests/: unit tests on simnet plus a rendezvous fuzz harness on the verifier.

## running it

you need clarinet, node, pnpm, and Docker.

contracts and tests:

```sh
clarinet check
npx vitest run
npx rv . intent-verifier invariant
```

the full devnet flow (chain, relay, solvers, web, plus a wallet) is written up
in DEMO.md. short version, four shells:

```sh
clarinet devnet start                        # chain + sBTC, auto-funded wallets
node relay/server.ts                         # mempool + auction
SOLVER_WALLET=wallet_2 node solver/agent.ts  # a solver (run a second for competition)
cd web && pnpm dev                           # the app
```

then point Leather at its devnet network, open the app, and seal an intent.

## status

the protocol and the whole flow are proven on a live devnet with real sBTC:
escrow, sealed auction, on-chain fill, and the frontend showing the lifecycle.
the agentic side of the solvers is still simple pricing, and the v3 confidential
matching is the sealed-bid auction, not yet a TEE or MPC network. those are the
next steps.
