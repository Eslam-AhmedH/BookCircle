export type BorrowRequestStatus = "Pending" | "Accepted" | "Rejected";

export interface BorrowRequest {
  id: number
  bookId: number
  bookTitle: string
  readerId: string
  readerName: string
  readerAvatarUrl?: string
  ownerId: string
  ownerName: string
  status: BorrowRequestStatus
  requestedAt: string
  respondedAt?: string
}