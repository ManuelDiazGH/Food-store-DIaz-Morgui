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
        `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'text-brand-700 bg-brand-50'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
        }`
      }
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </NavLink>
  )
}
