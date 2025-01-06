;; Optimization Services Marketplace Contract

(define-fungible-token compute-token)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_LISTING (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u102))

;; Data variables
(define-data-var listing-count uint u0)

;; Data maps
(define-map service-listings
  uint
  {
    provider: principal,
    algorithm-id: uint,
    compute-amount: uint,
    price: uint,
    expiration: uint
  }
)

;; Public functions
(define-public (create-service-listing (algorithm-id uint) (compute-amount uint) (price uint) (expiration uint))
  (let
    (
      (listing-id (+ (var-get listing-count) u1))
    )
    (map-set service-listings
      listing-id
      {
        provider: tx-sender,
        algorithm-id: algorithm-id,
        compute-amount: compute-amount,
        price: price,
        expiration: (+ block-height expiration)
      }
    )
    (var-set listing-count listing-id)
    (ok listing-id)
  )
)

(define-public (purchase-service (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? service-listings listing-id) ERR_INVALID_LISTING))
      (buyer tx-sender)
    )
    (asserts! (>= (stx-get-balance buyer) (get price listing)) ERR_INSUFFICIENT_BALANCE)
    (asserts! (< block-height (get expiration listing)) ERR_INVALID_LISTING)
    (try! (stx-transfer? (get price listing) buyer (get provider listing)))
    (try! (ft-mint? compute-token (get compute-amount listing) buyer))
    (map-delete service-listings listing-id)
    (ok true)
  )
)

(define-public (cancel-service-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? service-listings listing-id) ERR_INVALID_LISTING))
    )
    (asserts! (is-eq tx-sender (get provider listing)) ERR_NOT_AUTHORIZED)
    (map-delete service-listings listing-id)
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-service-listing (listing-id uint))
  (map-get? service-listings listing-id)
)

(define-read-only (get-listing-count)
  (var-get listing-count)
)

