# BookCircle Frontend Coverage Matrix

| Requirement | Status | Frontend Evidence | Notes |
|---|---|---|---|
| Different actors can log in/log out | Done | `src/app/providers/AuthContext.tsx`, `src/pages/LoginPage.tsx`, `src/widgets/Sidebar.tsx` | Role-aware login/logout is implemented |
| Reader can view available books without logging in | Done | `src/app/routes/AppRouter.tsx`, `src/app/layouts/GuestLayout.tsx`, `src/pages/GuestBrowsePage.tsx`, `src/pages/GuestBookDetailPage.tsx` | Public browse/detail routes are available |
| Reader cannot borrow unless logged in | Done | `src/pages/GuestBookDetailPage.tsx`, `src/pages/BookDetailPage.tsx`, `src/app/routes/AppRouter.tsx` | Borrow action only exists in authenticated detail flow |
| Admin can accept/reject newly registered owners | Done | `src/pages/AdminPage.tsx`, `src/services/mock/mockAdminService.ts` | Moderation actions wired |
| Admin can accept/reject book posts before publishing | Done | `src/pages/AdminPage.tsx`, `src/services/mock/mockAdminService.ts` | Book approval queue implemented |
| Reader can browse/search by genre/language/borrow price | Done | `src/pages/SearchPage.tsx`, `src/services/interfaces/IBooksService.ts`, `src/services/mock/mockBooksService.ts` | Genre + language + max price all implemented |
| Book post includes required fields | Done | `src/entities/book.ts`, `src/pages/AddBookPage.tsx`, `src/pages/EditBookPage.tsx` | Required metadata fields present |
| Reader can send borrow request | Done | `src/pages/BookDetailPage.tsx`, `src/services/mock/mockRequestsService.ts` | Request action implemented |
| Owner can accept/reject borrow requests | Done | `src/pages/RequestsPage.tsx`, `src/services/mock/mockRequestsService.ts` | Request response flow implemented |
| On acceptance, book status becomes Borrowed | Done | `src/services/mock/mockRequestsService.ts` | Accept path sets `book.status = "Borrowed"` |
| Reader can like/dislike books | Done | `src/pages/BookDetailPage.tsx`, `src/services/mock/mockBooksService.ts` | Reactions and counters implemented |
| Readers can comment with one-level replies | Done | `src/pages/BookDetailPage.tsx`, `src/entities/comment.ts`, `src/services/mock/mockCommentService.ts`, `src/features/comments/useComments.ts` | Top-level comments + single-level replies implemented |
| Users can create reading lists | Done | `src/pages/ReadingListPage.tsx`, `src/services/mock/mockReadingListService.ts` | Reading list CRUD present |
| Owner can manage book posts (CRUD) | Done | `src/pages/OwnerDashboardPage.tsx`, `src/pages/AddBookPage.tsx`, `src/pages/EditBookPage.tsx`, `src/services/mock/mockBooksService.ts` | Full CRUD implemented |
| Owner cannot delete borrowed book | Done | `src/pages/OwnerDashboardPage.tsx`, `src/services/mock/mockBooksService.ts` | UI and service-level restriction added |
| Real-time sockets for notifications/comments | Partial | `src/services/interfaces/ISocketService.ts`, `src/services/mock/mockSocketService.ts`, `src/features/socket/useSocket.ts`, `src/app/layouts/DashboardLayout.tsx`, `src/pages/BookDetailPage.tsx` | Socket abstraction and mock event bus exist; real backend socket server integration pending |
| DB schema is required | Missing (frontend repo) | N/A | Must be delivered by backend/data layer |
