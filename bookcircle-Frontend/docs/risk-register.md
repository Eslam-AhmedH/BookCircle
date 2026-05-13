# BookCircle Risk Register

| Risk | Impact | Likelihood | Mitigation | Owner |
|---|---|---|---|---|
| Mock behavior diverges from backend behavior | High | High | Lock API contracts early, add integration tests against real API before release | FE + BE leads |
| Socket payload mismatch between FE and BE | High | Medium | Freeze socket event contract and validate payloads with shared schema/types | FE + BE |
| Role authorization gaps (Owner/Admin/Reader) | High | Medium | Enforce role checks on backend for every protected endpoint, keep frontend guards as UX only | BE |
| Optimistic UI rollback inconsistencies | Medium | Medium | Keep snapshots before mutation and rollback on error; add negative-path tests | FE |
| Borrow status race conditions | High | Medium | Server-side transactional update for request acceptance + book status change | BE |
| Guest routes accidentally exposing privileged actions | High | Low | Keep borrow/save/comment-create endpoints protected; frontend shows CTA only for guests | FE + BE |
| Data schema mismatch (field names/types) | High | Medium | Publish shared JSON schema/OpenAPI and validate responses in FE adapters | FE + BE |
| Pagination/filter differences across environments | Medium | Medium | Standardize query contract (`q`, `genre`, `language`, `maxPrice`, `page`, `limit`) | BE |
| Comment reply depth not enforced | Medium | Medium | Backend validation: only allow `parentId` referencing top-level comments | BE |
| Pre-existing unrelated lint errors hide regressions | Medium | Medium | Track touched-file lint gates separately and maintain baseline issue list | FE |
