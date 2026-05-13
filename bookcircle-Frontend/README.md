# BookCircle Frontend

BookCircle is a community-driven book sharing platform where users can lend, borrow, and discuss books.

## Tech Stack

- React + TypeScript + Vite
- TailwindCSS
- Mock service layer with backend-ready interfaces

## Roles

- Admin
- Book Owner
- Reader
- Guest (public browse only)

## Key Features Implemented

- Role-based authentication and protected routes
- Guest browsing (`/browse`) and guest book detail (`/browse/:id`)
- Admin moderation (owner approvals and book approvals)
- Book search with genre, language, status, and max price filters
- Borrow request flow (send/respond) with status transition to `Borrowed` on accept
- Likes/dislikes on books
- Comments with one-level replies
- Reading list management
- Owner CRUD for books with borrowed-delete restriction

## Project Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Handoff Docs

- Coverage matrix: `docs/coverage-matrix.md`
- Backend endpoints contract: `docs/backend-endpoints-contract.md`
- Socket event contract: `docs/socket-events-contract.md`
- Risk register: `docs/risk-register.md`

## Current Delivery Status

- Frontend feature coverage is largely complete for the rubric
- Socket flow is implemented via a mock socket service abstraction and hooks
- Real backend socket integration and DB schema artifact are backend/data deliverables
