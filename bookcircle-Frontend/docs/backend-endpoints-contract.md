# BookCircle Backend Endpoint Contract

## Base

- Base URL: `/api`
- Auth: `Authorization: Bearer <token>` for protected endpoints
- Error shape:

```json
{
  "message": "Human-readable error message",
  "code": "OPTIONAL_MACHINE_CODE"
}
```

## Enums

- `UserRole`: `Admin | Owner | Reader`
- `BookStatus`: `Available | Borrowed`
- `BorrowRequestStatus`: `Pending | Accepted | Rejected`
- `ReactionType`: `Like | Dislike`
- `NotificationType`: `BorrowRequest | BorrowAccepted | BorrowRejected | BookApproved | BookRejected | NewComment`

## Auth

### POST `/auth/login`
- Auth: Public
- Request:

```json
{ "email": "string", "password": "string" }
```

- Response:

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "role": "Admin",
    "avatarUrl": "string | null",
    "isApproved": true
  }
}
```

### POST `/auth/register`
- Auth: Public
- Request:

```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "role": "Owner"
}
```

- Response:

```json
{
  "needsApproval": true,
  "token": "string | null",
  "user": { "id": "string", "fullName": "string", "email": "string", "role": "Owner", "avatarUrl": null, "isApproved": false }
}
```

### GET `/auth/me`
- Auth: Protected
- Response: current user profile

### POST `/auth/logout`
- Auth: Protected
- Response: `204 No Content`

## Books

### GET `/books`
- Auth: Public
- Query params:
  - `q?: string`
  - `genre?: string`
  - `status?: Available|Borrowed`
  - `language?: string`
  - `maxPrice?: number`
  - `page?: number`
  - `limit?: number`
  - `sortBy?: createdAt|borrowPrice|title`
  - `sortDir?: asc|desc`
- Response:

```json
{
  "items": [
    {
      "id": 1,
      "ownerId": "u-1",
      "ownerName": "string",
      "title": "string",
      "author": "string",
      "genre": "string",
      "isbn": "string",
      "language": "string",
      "publicationDate": "ISO date",
      "borrowPrice": 2.5,
      "status": "Available",
      "availableFrom": "ISO date",
      "availableTo": "ISO date",
      "coverImageUrl": "string",
      "description": "string",
      "isApproved": true,
      "likes": 0,
      "dislikes": 0
    }
  ],
  "page": 1,
  "limit": 12,
  "total": 120
}
```

### GET `/books/:id`
- Auth: Public
- Response: single book object

### GET `/books/owner/:ownerId`
- Auth: Owner/Admin
- Response: owner books array

### POST `/books`
- Auth: Owner/Admin
- Request: multipart or JSON with create fields
- Response: created book

### PATCH `/books/:id`
- Auth: Owner/Admin (owner of book or admin)
- Request: partial update fields
- Response: updated book

### DELETE `/books/:id`
- Auth: Owner/Admin (owner of book or admin)
- Behavior: reject delete if status is `Borrowed`
- Error: `409` with message if borrowed

### POST `/books/:id/reactions`
- Auth: Reader/Admin
- Request:

```json
{ "reaction": "Like" }
```

- Response:

```json
{ "likes": 10, "dislikes": 2 }
```

## Borrow Requests

### GET `/borrow-requests/incoming`
- Auth: Owner/Admin
- Response: requests for current owner books

### GET `/borrow-requests/mine`
- Auth: Reader/Admin
- Response: current reader requests

### POST `/borrow-requests`
- Auth: Reader/Admin
- Request:

```json
{ "bookId": 1 }
```

- Response: created request

### PATCH `/borrow-requests/:id/respond`
- Auth: Owner/Admin
- Request:

```json
{ "status": "Accepted" }
```

- Behavior: when accepted, server sets related book status to `Borrowed`
- Response: updated request

## Comments

### GET `/books/:bookId/comments`
- Auth: Public
- Response:

```json
[
  {
    "id": 1,
    "bookId": 1,
    "userId": "u-1",
    "userName": "string",
    "userAvatarUrl": "string | null",
    "content": "string",
    "createdAt": "ISO timestamp",
    "parentId": null
  }
]
```

### POST `/books/:bookId/comments`
- Auth: Protected
- Request:

```json
{ "content": "string", "parentId": null }
```

- Constraint: only one reply level (`parentId` can point only to a top-level comment)
- Response: created comment

### DELETE `/comments/:commentId`
- Auth: Protected
- Constraint: only comment owner or admin
- Response: `204 No Content`

## Reading Lists

### GET `/reading-lists`
- Auth: Reader/Admin
- Response: current user lists

### POST `/reading-lists`
- Auth: Reader/Admin
- Request:

```json
{ "name": "Favorites" }
```

- Response: created list

### GET `/reading-lists/:listId/items`
- Auth: Reader/Admin
- Response: list items

### POST `/reading-lists/:listId/items`
- Auth: Reader/Admin
- Request:

```json
{ "bookId": 1 }
```

- Response: created list item

### DELETE `/reading-lists/:listId/items/:bookId`
- Auth: Reader/Admin
- Response: `204 No Content`

## Notifications

### GET `/notifications`
- Auth: Protected
- Response: notification list

### PATCH `/notifications/:id/read`
- Auth: Protected
- Response: updated notification

### PATCH `/notifications/read-all`
- Auth: Protected
- Response: `204 No Content`

## Admin Moderation

### GET `/admin/pending-users`
- Auth: Admin
- Response: pending owner accounts

### PATCH `/admin/users/:userId/approve`
- Auth: Admin
- Response: `204 No Content`

### PATCH `/admin/users/:userId/reject`
- Auth: Admin
- Response: `204 No Content`

### GET `/admin/pending-books`
- Auth: Admin
- Response: pending books

### PATCH `/admin/books/:bookId/approve`
- Auth: Admin
- Response: `204 No Content`

### PATCH `/admin/books/:bookId/reject`
- Auth: Admin
- Response: `204 No Content`
