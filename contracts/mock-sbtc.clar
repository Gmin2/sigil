;; mock sBTC for local devnet testing - SIP-010 fungible token with an open faucet

(impl-trait .sip010-trait.sip010)

(define-fungible-token sbtc)

(define-constant ERR-NOT-OWNER (err u101))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-OWNER)
    (try! (ft-transfer? sbtc amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; open faucet so anyone can grab test sBTC
(define-public (faucet (amount uint))
  (ft-mint? sbtc amount tx-sender)
)

(define-read-only (get-name) (ok "Mock sBTC"))
(define-read-only (get-symbol) (ok "sBTC"))
(define-read-only (get-decimals) (ok u8))
(define-read-only (get-balance (who principal)) (ok (ft-get-balance sbtc who)))
(define-read-only (get-total-supply) (ok (ft-get-supply sbtc)))
(define-read-only (get-token-uri) (ok none))
