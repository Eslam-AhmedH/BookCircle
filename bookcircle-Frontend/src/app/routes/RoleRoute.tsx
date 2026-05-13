import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import type { UserRole } from '../../entities/user'
import { appRoutes } from '../../shared/config/routes'

interface RoleRouteProps {
  allowedRoles: UserRole[]
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to={appRoutes.login} replace />

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={appRoutes.forbidden} replace />
  }

  return <Outlet />
}
