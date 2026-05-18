/** OrderTable — Table of all orders for the management panel.

Shows order ID, client name, date, status badge, total, and action buttons
for valid FSM transitions. Supports auto-refresh via refetchInterval.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Pedido } from '@entities/types'
import { useOrderActions, getValidTransitions } from '../hooks/useOrderActions'
import { orderPanelDetailPath } from '@shared/config/routes'
import { StateTransitionButton } from './StateTransitionButton'
import { TransitionModal } from './TransitionModal'

interface OrderTableProps {
  pedidos: Pedido[]
}

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

export function OrderTable({ pedidos }: OrderTableProps) {
  const [modalState, setModalState] = useState<{
    open: boolean
    pedidoId: number
    estadoHasta: string
  }>({ open: false, pedidoId: 0, estadoHasta: '' })

  const transitionMutation = useOrderActions(modalState.pedidoId)

  function handleTransitionClick(pedidoId: number, estadoHasta: string) {
    setModalState({ open: true, pedidoId, estadoHasta })
  }

  function handleConfirm(observacion?: string) {
    transitionMutation.mutate(
      { estado_hasta: modalState.estadoHasta, observacion },
      {
        onSuccess: () => {
          setModalState({ open: false, pedidoId: 0, estadoHasta: '' })
        },
        onError: () => {
          // Error is handled by the mutation hooks
          setModalState({ open: false, pedidoId: 0, estadoHasta: '' })
        },
      },
    )
  }

  function isActionDisabled(estadoActual: string): boolean {
    // Terminal states and PENDIENTE (no advance buttons, only cancel)
    return ['ENTREGADO', 'CANCELADO'].includes(estadoActual)
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pedidos.map((pedido) => {
              const allActions = getValidTransitions(pedido.estado_codigo)

              return (
                <tr key={pedido.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                    <Link to={orderPanelDetailPath(pedido.id)} className="font-medium text-brand-600 hover:underline">
                      #{pedido.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{pedido.usuario?.nombre ?? `Usuario #${pedido.usuario_id}`}</td>
                  <td className="px-4 py-3 text-stone-500">
                    {new Date(pedido.created_at).toLocaleDateString('es-AR', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[pedido.estado_codigo] || ''}`}>
                      {STATUS_LABELS[pedido.estado_codigo] || pedido.estado_codigo}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900">${Number(pedido.total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {isActionDisabled(pedido.estado_codigo) ? (
                      <span className="text-xs text-stone-400">—</span>
                    ) : (
                      <div className="flex gap-1.5 flex-wrap">
                        {allActions.map((estadoHasta) => (
                          <StateTransitionButton
                            key={estadoHasta}
                            estadoActual={pedido.estado_codigo}
                            estadoHasta={estadoHasta}
                            onClick={() => handleTransitionClick(pedido.id, estadoHasta)}
                            disabled={transitionMutation.isPending}
                          />
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Confirmation modal */}
      <TransitionModal
        open={modalState.open}
        estadoHasta={modalState.estadoHasta}
        onConfirm={handleConfirm}
        onCancel={() => setModalState({ open: false, pedidoId: 0, estadoHasta: '' })}
        isLoading={transitionMutation.isPending}
      />
    </>
  )
}
