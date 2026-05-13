# BookCircle Socket Event Contract

## Connection

- Transport: WebSocket or Socket.IO
- Auth: Bearer token during handshake
- Frontend connects on authenticated layout mount

## Events

| Event Name | Emitted By | Listened By | Payload Schema | Trigger |
|---|---|---|---|---|
| `borrow_request_new` | Backend | Owner clients, Admin clients | `{ "requestId": number, "bookId": number, "bookTitle": string, "readerName": string }` | Reader sends borrow request |
| `borrow_request_accepted` | Backend | Reader client | `{ "requestId": number, "bookId": number, "bookTitle": string }` | Owner/Admin accepts request |
| `borrow_request_rejected` | Backend | Reader client | `{ "requestId": number, "bookId": number, "bookTitle": string }` | Owner/Admin rejects request |
| `comment_new` | Backend | All clients currently viewing same book, relevant owner/admin | `{ "commentId": number, "bookId": number, "userName": string, "content": string, "parentId": null }` | New top-level comment created |
| `comment_reply` | Backend | All clients currently viewing same book, relevant owner/admin | `{ "commentId": number, "bookId": number, "parentId": number, "userName": string, "content": string }` | Reply comment created |
| `notification_new` | Backend | Target user client | `{ "notificationId": number, "message": string, "type": string }` | New in-app notification generated |
| `book_status_changed` | Backend | Clients viewing/searching impacted book | `{ "bookId": number, "status": "Available" \| "Borrowed" }` | Request accepted/returned status update |

## Frontend Notes

- Current frontend event types are defined in `src/services/interfaces/ISocketService.ts`
- Socket lifecycle hook: `src/features/socket/useSocket.ts`
- Authenticated auto-connect: `src/app/layouts/DashboardLayout.tsx`
- Book comments currently subscribe to `comment_new` in `src/pages/BookDetailPage.tsx`

## Delivery Guarantees

- Events should include server-generated IDs and timestamps where possible
- Backend should broadcast only to relevant users/rooms to avoid cross-user leaks
- On reconnect, client should refetch critical resources (`notifications`, `comments`, `requests`) for consistency
