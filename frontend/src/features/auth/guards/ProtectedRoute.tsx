import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/authStore'
import { ROUTES } from '@shared/config/routes'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${ROUTES.LOGIN}?redirect=${redirect}`} replace />
  }

  return <Outlet />
}