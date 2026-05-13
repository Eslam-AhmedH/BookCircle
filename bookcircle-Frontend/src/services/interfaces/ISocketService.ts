export type SocketEventType =
  | 'borrow_request_new'
  | 'borrow_request_accepted'
  | 'borrow_request_rejected'
  | 'comment_new'
  | 'comment_reply'
  | 'notification_new'
  | 'book_status_changed'

export interface SocketEventPayload {
  borrow_request_new: { requestId: number; bookId: number; bookTitle: string; readerName: string }
  borrow_request_accepted: { requestId: number; bookId: number; bookTitle: string }
  borrow_request_rejected: { requestId: number; bookId: number; bookTitle: string }
  comment_new: { commentId: number; bookId: number; userName: string; content: string; parentId: number | null }
  comment_reply: { commentId: number; bookId: number; parentId: number; userName: string; content: string }
  notification_new: { notificationId: number; message: string; type: string }
  book_status_changed: { bookId: number; status: 'Available' | 'Borrowed' }
}

export interface ISocketService {
  connect(token: string): void
  disconnect(): void
  on<E extends SocketEventType>(event: E, handler: (payload: SocketEventPayload[E]) => void): void
  off<E extends SocketEventType>(event: E, handler: (payload: SocketEventPayload[E]) => void): void
  emit(event: string, payload: unknown): void
  isConnected(): boolean
}
