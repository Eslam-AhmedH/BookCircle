import axiosInstance from './axiosInstance'
import type { INotificationsService } from '../interfaces/INotificationsService'
import type { Notification } from '../../entities/notification'

export const notificationsService: INotificationsService = {

  async getAll(): Promise<Notification[]> {
    const response = await axiosInstance.get('/api/notifications')
    return response.data
  },

  async markAsRead(id: number): Promise<void> {
    await axiosInstance.patch(`/api/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await axiosInstance.patch('/api/notifications/read-all')
  },
}