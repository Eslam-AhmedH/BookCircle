import axiosInstance from './axiosInstance'
import type { IReadingListService } from '../interfaces/IReadingListService'
import type { ReadingList, ReadingListItem } from '../../entities/reading-list'

export const readingListService: IReadingListService = {

  async getLists(): Promise<ReadingList[]> {
    const response = await axiosInstance.get('/api/reading-lists')
    return response.data
  },

  async getListItems(listId: number): Promise<ReadingListItem[]> {
    const response = await axiosInstance.get(
      `/api/reading-lists/${listId}/items`
    )
    return response.data
  },

  async createList(name: string): Promise<ReadingList> {
    const response = await axiosInstance.post('/api/reading-lists', { name })
    return response.data
  },

  async addBook(listId: number, bookId: number): Promise<ReadingListItem> {
    const response = await axiosInstance.post(
      `/api/reading-lists/${listId}/items`,
      { bookId }
    )
    return response.data
  },

  async removeBook(listId: number, bookId: number): Promise<void> {
    await axiosInstance.delete(
      `/api/reading-lists/${listId}/items/${bookId}`
    )
  },
}