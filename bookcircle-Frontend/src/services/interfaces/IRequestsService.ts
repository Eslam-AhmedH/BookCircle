import type { BorrowRequest } from '../../entities/borrow-request'

export interface IRequestsService {
  getIncoming(): Promise<BorrowRequest[]>
  getMyRequests(): Promise<BorrowRequest[]>
  sendRequest(bookId: number): Promise<BorrowRequest>
  respond(id: number, status: 'Accepted' | 'Rejected'): Promise<BorrowRequest>
  returnBook(id: number): Promise<BorrowRequest>
}
