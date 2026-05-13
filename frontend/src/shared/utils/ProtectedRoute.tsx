/** ProtectedRoute — Route guard that redirects unauthenticated or unauthorized users. */
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/authStore'

interface ProtectedRouteProps {
  requiredRoles: string[]
  children: ReactNode
}

export function ProtectedRoute({ requiredRoles, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  // Not authenticated → redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check roles
  const userRoles = user.roles ?? []
  const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role))

  // Authenticated but wrong role → 403
  if (!hasRequiredRole) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300">403</h1>
          <p className="mt-2 text-lg text-gray-600">No tenés permisos para acceder a esta página.</p>
          <p className="mt-1 text-sm text-gray-400">
            Se requiere uno de los siguientes roles: {requiredRoles.join(', ')}
          </p>
          <a
            href="/"
            className="mt-4 inline-block text-blue-600 hover:underline text-sm"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}