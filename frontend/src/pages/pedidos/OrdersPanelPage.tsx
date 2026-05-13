import { useState } from 'react'
import { useAllPedidos } from '@entities/api/pedidosApi'
import { OrderTable } from '@features/pedidos'
import type { Pedido } from '@entities/types'

const ALL_STATUSES = [
  'TODOS', 'PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO',
] as const

const STATUS_LABELS: Record<string, string> = {
  TODOS: 'Todos',
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  EN_PREPARACION: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export default function OrdersPanelPage() {
  const { data: pedidos, isLoading, error } = useAllPedidos()
  const [statusFilter, setStatusFilter] = useState<string>('TODOS')

  const filtered = statusFilter === 'TODOS'
    ? pedidos
    : pedidos?.filter((p) => p.estado_codigo === statusFilter)

  // Sort by most recent first
  const sorted = filtered
    ? [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📋 Panel de Pedidos</h1>

        {/* Auto-refresh info */}
        <span className="text-xs text-gray-400">Actualización automática cada 30s</span>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              statusFilter === st ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {STATUS_LABELS[st]}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-gray-400">Cargando pedidos...</div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-2">Error al cargar pedidos</p>
          <button onClick={() => window.location.reload()} className="text-orange-600 hover:underline text-sm">
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && sorted.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-gray-500">No hay pedidos {statusFilter !== 'TODOS' ? `en estado "${STATUS_LABELS[statusFilter]}"` : ''}</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && sorted.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <OrderTable pedidos={sorted} />
        </div>
      )}
    </div>
  )
}
