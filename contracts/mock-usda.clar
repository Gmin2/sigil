;; mock USDA stablecoin for local devnet testing - SIP-010 fungible token with an open faucet

(impl-trait .sip010-trait.sip010)

(define-fungible-token usda)

(define-constant ERR-NOT-OWNER (err u101))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-OWNER)
    (try! (ft-transfer? usda amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

(define-public (faucet (amount uint))
  (ft-mint? usda amount tx-sender)
)

(define-read-only (get-name) (ok "Mock USDA"))
(define-read-only (get-symbol) (ok "USDA"))
(define-read-only (get-decimals) (ok u6))
(define-read-only (get-balance (who principal)) (ok (ft-get-balance usda who)))
(define-read-only (get-total-supply) (ok (ft-get-supply usda)))
(define-read-only (get-token-uri) (ok none))
