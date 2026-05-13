import axiosInstance from './axiosInstance'
import type { IAdminService } from '../interfaces/IAdminService'
import type { Book } from '../../entities/book'
import type { UserProfile } from '../../entities/user'

export const adminService: IAdminService = {

  async getPendingUsers(): Promise<UserProfile[]> {
    const response = await axiosInstance.get('/api/admin/pending-users')
    return response.data
  },

  async approveUser(userId: string): Promise<void> {
    await axiosInstance.patch(`/api/admin/users/${userId}/approve`)
  },

  async rejectUser(userId: string): Promise<void> {
    await axiosInstance.patch(`/api/admin/users/${userId}/reject`)
  },

  async getPendingBooks(): Promise<Book[]> {
    const response = await axiosInstance.get('/api/admin/pending-books')
    return response.data
  },

  async approveBook(bookId: number): Promise<void> {
    await axiosInstance.patch(`/api/admin/books/${bookId}/approve`)
  },

  async rejectBook(bookId: number): Promise<void> {
    await axiosInstance.patch(`/api/admin/books/${bookId}/reject`)
  },
}
