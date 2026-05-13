import type { Notification } from '../../entities/notification'

export interface INotificationsService {
  getAll(): Promise<Notification[]>
  markAsRead(id: number): Promise<void>
  markAllAsRead(): Promise<void>
}
