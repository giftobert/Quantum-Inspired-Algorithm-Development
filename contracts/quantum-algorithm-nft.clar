;; Quantum-Inspired Algorithm NFT Contract

(define-non-fungible-token quantum-algorithm-nft uint)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_NFT (err u101))

;; Data variables
(define-data-var last-token-id uint u0)

;; Data maps
(define-map token-metadata
  uint
  {
    creator: principal,
    algorithm-id: uint,
    name: (string-ascii 100),
    description: (string-utf8 500),
    innovation-score: uint,
    creation-time: uint
  }
)

;; Public functions
(define-public (mint-algorithm-nft (algorithm-id uint) (name (string-ascii 100)) (description (string-utf8 500)) (innovation-score uint))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
    )
    (asserts! (and (>= innovation-score u0) (<= innovation-score u100)) ERR_NOT_AUTHORIZED)
    (try! (nft-mint? quantum-algorithm-nft token-id tx-sender))
    (map-set token-metadata
      token-id
      {
        creator: tx-sender,
        algorithm-id: algorithm-id,
        name: name,
        description: description,
        innovation-score: innovation-score,
        creation-time: block-height
      }
    )
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

(define-public (transfer-algorithm-nft (token-id uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (unwrap! (nft-get-owner? quantum-algorithm-nft token-id) ERR_INVALID_NFT)) ERR_NOT_AUTHORIZED)
    (try! (nft-transfer? quantum-algorithm-nft token-id tx-sender recipient))
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-algorithm-nft-metadata (token-id uint))
  (map-get? token-metadata token-id)
)

(define-read-only (get-algorithm-nft-owner (token-id uint))
  (nft-get-owner? quantum-algorithm-nft token-id)
)

(define-read-only (get-last-token-id)
  (var-get last-token-id)
)

