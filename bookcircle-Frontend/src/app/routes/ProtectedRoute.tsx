import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import { appRoutes } from '../../shared/config/routes'

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={appRoutes.login} state={{ from: location }} replace />
  }

  return <Outlet />
}
