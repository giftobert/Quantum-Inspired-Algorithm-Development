;; Collaborative Development Platform Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_PROJECT (err u101))

;; Data variables
(define-data-var project-count uint u0)

;; Data maps
(define-map collaborative-projects
  uint
  {
    lead-developer: principal,
    algorithm-id: uint,
    title: (string-ascii 100),
    description: (string-utf8 1000),
    collaborators: (list 10 principal),
    status: (string-ascii 20),
    start-time: uint,
    end-time: (optional uint)
  }
)

(define-map project-contributions
  { project-id: uint, contributor: principal }
  {
    contribution: (string-utf8 1000),
    timestamp: uint
  }
)

;; Public functions
(define-public (create-project (algorithm-id uint) (title (string-ascii 100)) (description (string-utf8 1000)))
  (let
    (
      (project-id (+ (var-get project-count) u1))
    )
    (map-set collaborative-projects
      project-id
      {
        lead-developer: tx-sender,
        algorithm-id: algorithm-id,
        title: title,
        description: description,
        collaborators: (list tx-sender),
        status: "active",
        start-time: block-height,
        end-time: none
      }
    )
    (var-set project-count project-id)
    (ok project-id)
  )
)

(define-public (add-collaborator (project-id uint) (collaborator principal))
  (let
    (
      (project (unwrap! (map-get? collaborative-projects project-id) ERR_INVALID_PROJECT))
    )
    (asserts! (is-eq tx-sender (get lead-developer project)) ERR_NOT_AUTHORIZED)
    (ok (map-set collaborative-projects
      project-id
      (merge project {
        collaborators: (unwrap! (as-max-len? (append (get collaborators project) collaborator) u10) ERR_NOT_AUTHORIZED)
      })
    ))
  )
)

(define-public (add-contribution (project-id uint) (contribution (string-utf8 1000)))
  (let
    (
      (project (unwrap! (map-get? collaborative-projects project-id) ERR_INVALID_PROJECT))
    )
    (asserts! (is-some (index-of (get collaborators project) tx-sender)) ERR_NOT_AUTHORIZED)
    (ok (map-set project-contributions
      { project-id: project-id, contributor: tx-sender }
      {
        contribution: contribution,
        timestamp: block-height
      }
    ))
  )
)

(define-public (end-project (project-id uint))
  (let
    (
      (project (unwrap! (map-get? collaborative-projects project-id) ERR_INVALID_PROJECT))
    )
    (asserts! (is-eq tx-sender (get lead-developer project)) ERR_NOT_AUTHORIZED)
    (ok (map-set collaborative-projects
      project-id
      (merge project {
        status: "completed",
        end-time: (some block-height)
      })
    ))
  )
)

;; Read-only functions
(define-read-only (get-project (project-id uint))
  (map-get? collaborative-projects project-id)
)

(define-read-only (get-contribution (project-id uint) (contributor principal))
  (map-get? project-contributions { project-id: project-id, contributor: contributor })
)

(define-read-only (get-project-count)
  (var-get project-count)
)

