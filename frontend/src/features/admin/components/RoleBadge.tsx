import type { RolCodigo } from '@entities/types'

const ROLE_CONFIG: Record<RolCodigo, { label: string; className: string }> = {
  ADMIN: {
    label: 'Admin',
    className: 'bg-red-100 text-red-800',
  },
  STOCK: {
    label: 'Stock',
    className: 'bg-blue-100 text-blue-800',
  },
  PEDIDOS: {
    label: 'Pedidos',
    className: 'bg-yellow-100 text-yellow-800',
  },
  CLIENT: {
    label: 'Cliente',
    className: 'bg-green-100 text-green-800',
  },
}

const FALLBACK: { label: string; className: string } = {
  label: 'Desconocido',
  className: 'bg-stone-100 text-stone-800',
}

interface RoleBadgeProps {
  role: string
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role as RolCodigo] ?? FALLBACK
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}