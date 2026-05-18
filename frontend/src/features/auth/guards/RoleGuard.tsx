import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/authStore'
import type { RolCodigo } from '@entities/types'

interface RoleGuardProps {
  allowedRoles: RolCodigo[]
  children?: ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)

  const userRoles: RolCodigo[] = (user?.roles as RolCodigo[]) ?? []
  const hasRole = userRoles.some((role) => allowedRoles.includes(role))

  if (!hasRole) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-stone-300 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-stone-800 mb-2">
            Acceso denegado
          </h2>
          <p className="text-stone-600 mb-6">
            No tenés permisos para acceder a esta página
          </p>
          <a
            href="/dashboard"
            className="inline-block rounded-lg bg-brand-600 px-6 py-2 text-white font-medium hover:bg-brand-700 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  return children ? <>{children}</> : <Outlet />
}