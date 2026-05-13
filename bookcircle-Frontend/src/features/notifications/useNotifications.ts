import { useAsync } from '../../shared/lib/useAsync'
import { notificationsService } from '../../services'
import { useSocketEvent } from '../socket/useSocket'

export const useNotifications = () => {
  const state = useAsync(() => notificationsService.getAll(), [])
  
  // Real-time update for new notifications without page refresh
  useSocketEvent("notification_new", () => {
    void state.refetch(true); // silent refetch to avoid loading spinner
  });

  const unreadCount = (state.data ?? []).filter(notification => !notification.isRead).length
  return { ...state, unreadCount }
}
