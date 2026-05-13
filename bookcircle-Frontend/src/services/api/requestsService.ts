import axiosInstance from './axiosInstance'
import type { IRequestsService } from '../interfaces/IRequestsService'
import type { BorrowRequest } from '../../entities/borrow-request'

export const requestsService: IRequestsService = {

  async getIncoming(): Promise<BorrowRequest[]> {
    const response = await axiosInstance.get('/api/borrow-requests/incoming')
    return response.data
  },

  async getMyRequests(): Promise<BorrowRequest[]> {
    const response = await axiosInstance.get('/api/borrow-requests/mine')
    return response.data
  },

  async sendRequest(bookId: number): Promise<BorrowRequest> {
    const response = await axiosInstance.post('/api/borrow-requests', {
      bookId,
    })
    return response.data
  },

  async respond(
    id: number,
    status: 'Accepted' | 'Rejected'
  ): Promise<BorrowRequest> {
    const response = await axiosInstance.patch(
      `/api/borrow-requests/${id}/respond`,
      { status }
    )
    return response.data
  },

  async returnBook(id: number): Promise<BorrowRequest> {
    const response = await axiosInstance.patch(`/api/borrow-requests/${id}/return`)
    return response.data
  }
}
