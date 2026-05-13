import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePedidos } from '@entities/api/pedidosApi'
import { ROUTES } from '@shared/config/routes'
import type { EstadoPedidoCodigo } from '@entities/types'

const STATUS_STYLES: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  CONFIRMADO: 'bg-blue-100 text-blue-700',
  EN_PREPARACION: 'bg-purple-100 text-purple-700',
  EN_CAMINO: 'bg-cyan-100 text-cyan-700',
  ENTREGADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  EN_PREPARACION: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

const ALL_STATUSES: EstadoPedidoCodigo[] = [
  'PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO',
]

export default function OrdersPage() {
  const { data: pedidos, isLoading, error } = usePedidos()
  const [statusFilter, setStatusFilter] = useState<EstadoPedidoCodigo | 'TODOS'>('TODOS')

  const filtered = statusFilter === 'TODOS'
    ? pedidos
    : pedidos?.filter((p) => p.estado_codigo === statusFilter)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Pedidos</h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('TODOS')}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            statusFilter === 'TODOS' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
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
      {!isLoading && !error && (!filtered || filtered.length === 0) && (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-gray-500 mb-2">
            {statusFilter === 'TODOS' ? 'No tenés pedidos aún' : `No tenés pedidos en estado "${STATUS_LABELS[statusFilter]}"`}
          </p>
          <Link
            to={ROUTES.CATALOG}
            className="inline-block mt-4 px-6 py-3 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700"
          >
            Ir al catálogo
          </Link>
        </div>
      )}

      {/* Orders list */}
      {!isLoading && !error && filtered && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((pedido) => (
            <Link
              key={pedido.id}
              to={`/orders/${pedido.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Pedido #{pedido.id}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(pedido.created_at).toLocaleDateString('es-AR', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {pedido.detalles?.length ?? 0} producto{(pedido.detalles?.length ?? 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[pedido.estado_codigo] || ''}`}>
                    {STATUS_LABELS[pedido.estado_codigo] || pedido.estado_codigo}
                  </span>
                  <p className="text-sm font-bold text-gray-900 mt-1">${Number(pedido.total).toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
