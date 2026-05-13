import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

interface NavItemProps {
  to: string
  icon?: string
  children: ReactNode
}

export function NavItem({ to, icon, children }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'text-orange-600 bg-orange-50'
            : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
        }`
      }
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </NavLink>
  )
}