export type NotificationType =
  | 'BorrowRequest'
  | 'BorrowAccepted'
  | 'BorrowRejected'
  | 'BookApproved'
  | 'BookRejected'
  | 'NewComment'

export interface Notification {
  id: number
  userId: string
  type: NotificationType
  message: string
  isRead: boolean
  createdAt: string
  relatedEntityId?: number
}
