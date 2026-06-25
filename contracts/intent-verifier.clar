;; Obscura intent verifier - confidential Bitcoin-native intents on Stacks.
;;
;; A maker escrows `amount-in` of `token-in` and posts only a commitment hash.
;; The intent details (output token, min output, recipient) stay hidden on-chain
;; until a solver fills it, so observers cannot frontrun the order. At fill time
;; the solver reveals the params; the contract checks the reveal matches the
;; commitment and that the delivered amount clears `min-out`, then settles
;; atomically: output -> maker, escrow -> solver.

(use-trait ft .sip010-trait.sip010)

(define-constant STATUS-OPEN u0)
(define-constant STATUS-FILLED u1)
(define-constant STATUS-CANCELLED u2)

(define-constant ERR-EXISTS (err u200))
(define-constant ERR-NOT-FOUND (err u201))
(define-constant ERR-NOT-OPEN (err u202))
(define-constant ERR-EXPIRED (err u203))
(define-constant ERR-NOT-EXPIRED (err u204))
(define-constant ERR-BAD-TOKEN-IN (err u205))
(define-constant ERR-COMMIT-MISMATCH (err u206))
(define-constant ERR-MIN-OUT (err u207))
(define-constant ERR-NOT-MAKER (err u208))

(define-map intents
  uint
  {
    maker: principal,
    token-in: principal,
    amount-in: uint,
    commit: (buff 32),
    expiry: uint,
    status: uint,
  }
)

(define-read-only (get-intent (id uint))
  (map-get? intents id)
)

;; Recompute the commitment the client signed: sha256 over the consensus
;; serialization of the revealed parameters. The client builds the identical
;; tuple with @stacks/transactions and hashes serializeCV(tuple), so the two
;; always agree.
(define-read-only (compute-commit
    (token-out principal)
    (min-out uint)
    (recipient principal)
    (salt (buff 32))
  )
  (sha256 (unwrap-panic (to-consensus-buff? {
    token-out: token-out,
    min-out: min-out,
    recipient: recipient,
    salt: salt,
  })))
)

;; Maker opens an intent: escrow token-in, publish only the commitment.
(define-public (create-intent
    (id uint)
    (token-in <ft>)
    (amount-in uint)
    (commit (buff 32))
    (expiry uint)
  )
  (begin
    (asserts! (is-none (map-get? intents id)) ERR-EXISTS)
    (asserts! (> expiry stacks-block-height) ERR-EXPIRED)
    (try! (contract-call? token-in transfer amount-in tx-sender (as-contract tx-sender) none))
    (map-set intents id {
      maker: tx-sender,
      token-in: (contract-of token-in),
      amount-in: amount-in,
      commit: commit,
      expiry: expiry,
      status: STATUS-OPEN,
    })
    (print { event: "intent-created", id: id, commit: commit, amount-in: amount-in })
    (ok true)
  )
)

;; Solver fills: reveal the params, deliver the output to the maker, claim escrow.
(define-public (fill-intent
    (id uint)
    (token-in <ft>)
    (token-out <ft>)
    (amount-out uint)
    (min-out uint)
    (recipient principal)
    (salt (buff 32))
  )
  (let (
      (intent (unwrap! (map-get? intents id) ERR-NOT-FOUND))
      (solver tx-sender)
    )
    (asserts! (is-eq (get status intent) STATUS-OPEN) ERR-NOT-OPEN)
    (asserts! (<= stacks-block-height (get expiry intent)) ERR-EXPIRED)
    (asserts! (is-eq (contract-of token-in) (get token-in intent)) ERR-BAD-TOKEN-IN)
    (asserts!
      (is-eq (get commit intent)
        (compute-commit (contract-of token-out) min-out recipient salt))
      ERR-COMMIT-MISMATCH)
    (asserts! (>= amount-out min-out) ERR-MIN-OUT)
    ;; solver delivers the output to the maker's chosen recipient
    (try! (contract-call? token-out transfer amount-out solver recipient none))
    ;; contract releases escrow to the solver
    (try! (as-contract (contract-call? token-in transfer (get amount-in intent) tx-sender solver none)))
    (map-set intents id (merge intent { status: STATUS-FILLED }))
    (print { event: "intent-filled", id: id, solver: solver, amount-out: amount-out })
    (ok true)
  )
)

;; Maker reclaims escrow after expiry on an unfilled intent.
(define-public (cancel-intent (id uint) (token-in <ft>))
  (let (
      (intent (unwrap! (map-get? intents id) ERR-NOT-FOUND))
      (maker (get maker intent))
    )
    (asserts! (is-eq tx-sender maker) ERR-NOT-MAKER)
    (asserts! (is-eq (get status intent) STATUS-OPEN) ERR-NOT-OPEN)
    (asserts! (> stacks-block-height (get expiry intent)) ERR-NOT-EXPIRED)
    (asserts! (is-eq (contract-of token-in) (get token-in intent)) ERR-BAD-TOKEN-IN)
    (try! (as-contract (contract-call? token-in transfer (get amount-in intent) tx-sender maker none)))
    (map-set intents id (merge intent { status: STATUS-CANCELLED }))
    (print { event: "intent-cancelled", id: id })
    (ok true)
  )
)

;; Rendezvous fuzzing harness, gated with #[env(simnet)] so it never reaches
;; mainnet. Run: npx rv . intent-verifier invariant (or test)

;; #[env(simnet)]
(define-map context (string-ascii 100) { called: uint })

;; #[env(simnet)]
(define-private (update-context (function-name (string-ascii 100)) (called uint))
  (ok (map-set context function-name { called: called }))
)

;; Solvency: the protocol can settle (fill) or refund (cancel) an intent at most
;; once, and only one that was created. So across the whole run, the number of
;; successful settlements never exceeds the number of intents created. A double
;; fill, a fill-after-cancel, or settling a non-existent intent would break this.
;; #[env(simnet)]
(define-read-only (invariant-settlements-le-creates)
  (let (
      (creates (default-to u0 (get called (map-get? context "create-intent"))))
      (fills (default-to u0 (get called (map-get? context "fill-intent"))))
      (cancels (default-to u0 (get called (map-get? context "cancel-intent"))))
    )
    (<= (+ fills cancels) creates)
  )
)

;; Property: creating an intent always moves exactly `amount-in` out of the
;; maker and records the intent as OPEN with that amount.
;; #[env(simnet)]
(define-private (test-create-escrows-funds (id uint) (amount uint) (salt (buff 32)))
  (if (or (is-eq amount u0) (is-some (map-get? intents id)))
    (ok false)
    (begin
      (try! (contract-call? .mock-sbtc faucet amount))
      (let (
          (bal-before (unwrap-panic (contract-call? .mock-sbtc get-balance tx-sender)))
          (commit (compute-commit .mock-usda amount tx-sender salt))
        )
        (try! (create-intent id .mock-sbtc amount commit (+ stacks-block-height u100)))
        (asserts!
          (is-eq (unwrap-panic (contract-call? .mock-sbtc get-balance tx-sender))
            (- bal-before amount))
          (err u902))
        (asserts! (is-eq (get amount-in (unwrap-panic (map-get? intents id))) amount) (err u903))
        (asserts! (is-eq (get status (unwrap-panic (map-get? intents id))) STATUS-OPEN) (err u904))
        (ok true)
      )
    )
  )
)

;; Security property: a solver can never fill an intent by revealing parameters
;; that do not hash to the maker's commitment. For any two different salts, a
;; fill using the wrong salt must be rejected with ERR-COMMIT-MISMATCH.
;; #[env(simnet)]
(define-private (test-fill-wrong-commit-rejected
    (id uint)
    (amount uint)
    (salt-a (buff 32))
    (salt-b (buff 32))
  )
  (if (or (is-eq amount u0) (is-some (map-get? intents id)) (is-eq salt-a salt-b))
    (ok false)
    (begin
      (try! (contract-call? .mock-sbtc faucet amount))
      (try! (contract-call? .mock-usda faucet amount))
      (let ((commit (compute-commit .mock-usda amount tx-sender salt-a)))
        (try! (create-intent id .mock-sbtc amount commit (+ stacks-block-height u100)))
        (asserts!
          (is-eq
            (unwrap-err! (fill-intent id .mock-sbtc .mock-usda amount amount tx-sender salt-b) (err u911))
            u206)
          (err u910))
        (ok true)
      )
    )
  )
)
