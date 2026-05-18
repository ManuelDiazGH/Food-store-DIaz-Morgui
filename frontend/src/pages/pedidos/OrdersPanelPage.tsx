import { useState, useEffect, useCallback } from 'react'
import { useAllPedidosPaginated } from '@entities/api/pedidosApi'
import type { OrderFilters } from '@entities/api/pedidosApi'
import { OrderTable } from '@features/pedidos'
import { OrderSearchBar } from '@widgets/pedidos/OrderSearchBar'

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
  const [filters, setFilters] = useState<OrderFilters>({})
  const [debouncedQ, setDebouncedQ] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.q !== debouncedQ) {
        setFilters((prev) => ({ ...prev, q: debouncedQ }))
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [debouncedQ, filters.q])

  const { data: response, isLoading, error } = useAllPedidosPaginated(filters)
  const pedidos = response?.items ?? []
  const total = response?.total ?? 0
  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const handleFilterChange = useCallback((newFilters: OrderFilters) => {
    setDebouncedQ(newFilters.q ?? '')
    setFilters(newFilters)
  }, [])

  function handleStatusClick(status: string) {
    setFilters((prev) => ({
      ...prev,
      estado: status === 'TODOS' ? undefined : status,
      page: 1,
    }))
  }

  function handlePageChange(newPage: number) {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Panel de Pedidos</h1>
        <span className="text-xs text-stone-400">Actualización automática cada 30s</span>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <OrderSearchBar filters={{ ...filters, q: debouncedQ }} onChange={handleFilterChange} />
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => handleStatusClick(st)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              (st === 'TODOS' && !filters.estado) || filters.estado === st
                ? 'bg-gray-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {STATUS_LABELS[st]}
          </button>
        ))}
      </div>

      {/* Results info */}
      {!isLoading && !error && (
        <p className="text-sm text-stone-500 mb-4">
          {total} resultado{total !== 1 ? 's' : ''}
          {page > 1 && ` — Página ${page} de ${totalPages}`}
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-stone-400">Cargando pedidos...</div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-2">Error al cargar pedidos</p>
          <button onClick={() => window.location.reload()} className="text-brand-600 hover:underline text-sm">
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && pedidos.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border border-stone-200">
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-stone-500">
            No hay pedidos{filters.estado ? ` en estado "${STATUS_LABELS[filters.estado]}"` : ''}
            {filters.q ? ` con "${filters.q}"` : ''}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && pedidos.length > 0 && (
        <div className="bg-white rounded-lg border border-stone-200">
          <OrderTable pedidos={pedidos} />
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>

          <span className="text-sm text-stone-600">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
