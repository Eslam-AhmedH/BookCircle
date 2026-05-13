import { useAsync } from '../../shared/lib/useAsync'
import { adminService } from '../../services'

export const usePendingUsers = () => useAsync(() => adminService.getPendingUsers(), [])

export const usePendingBooks = () => useAsync(() => adminService.getPendingBooks(), [])
