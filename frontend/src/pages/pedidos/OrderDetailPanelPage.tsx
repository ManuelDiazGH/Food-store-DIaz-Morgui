/** OrderDetailPanelPage — Admin/Gestor detail view for a single order (US-052).

Shows full order info, customer data, FSM transition buttons, and audit trail.
 */
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePedidoDetalle, useHistorialPedido, usePagoByPedido } from '@entities/api/pedidosApi'
import { ROUTES } from '@shared/config/routes'
import { useOrderActions, getValidTransitions } from '@features/pedidos'
import { StateTransitionButton } from '@features/pedidos/components/StateTransitionButton'
import { TransitionModal } from '@features/pedidos/components/TransitionModal'

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

export default function OrderDetailPanelPage() {
  const { id } = useParams<{ id: string }>()
  const orderId = Number(id)

  const { data: pedido, isLoading, error } = usePedidoDetalle(orderId)
  const { data: historial } = useHistorialPedido(orderId)
  const { data: pagos } = usePagoByPedido(orderId)

  const [modalState, setModalState] = useState<{
    open: boolean
    estadoHasta: string
  }>({ open: false, estadoHasta: '' })

  const transitionMutation = useOrderActions(orderId)

  function handleTransitionClick(estadoHasta: string) {
    setModalState({ open: true, estadoHasta })
  }

  function handleConfirm(observacion?: string) {
    transitionMutation.mutate(
      { estado_hasta: modalState.estadoHasta, observacion },
      {
        onSuccess: () => {
          setModalState({ open: false, estadoHasta: '' })
        },
        onError: () => {
          setModalState({ open: false, estadoHasta: '' })
        },
      },
    )
  }

  if (isLoading) {
    return <div className="text-center py-12 text-stone-400">Cargando pedido...</div>
  }

  if (error || !pedido) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">
          {(error as any)?.response?.status === 404
            ? 'Pedido no encontrado'
            : 'Error al cargar el pedido'}
        </p>
        <Link to={ROUTES.ORDERS_PANEL} className="text-brand-600 hover:underline text-sm">
          Volver al panel
        </Link>
      </div>
    )
  }

  const validTransitions = getValidTransitions(pedido.estado_codigo)
  const allActions = pedido.estado_codigo === 'PENDIENTE'
    ? [...validTransitions, 'CANCELADO']
    : validTransitions

  const addressParts = [
    pedido.direccion_snapshot_linea1,
    pedido.direccion_snapshot_linea2,
  ].filter(Boolean).join(', ')

  return (
    <div>
      <Link
        to={ROUTES.ORDERS_PANEL}
        className="text-brand-600 hover:underline mb-4 inline-block text-sm"
      >
        ← Volver al panel
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Pedido #{pedido.id}</h1>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${STATUS_STYLES[pedido.estado_codigo] || ''}`}>
          {STATUS_LABELS[pedido.estado_codigo] || pedido.estado_codigo}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: items + customer + address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Productos</h2>
            <div className="space-y-3">
              {pedido.detalles?.map((detalle) => (
                <div key={detalle.id} className="flex justify-between items-start py-2 border-b border-stone-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{detalle.nombre_snapshot}</p>
                    <p className="text-xs text-stone-500">
                      ${Number(detalle.precio_snapshot).toFixed(2)} x {detalle.cantidad}
                    </p>
                    {detalle.personalizacion && detalle.personalizacion.length > 0 && (
                      <p className="text-xs text-red-500 mt-0.5">
                        Sin {detalle.personalizacion.length} ingrediente{detalle.personalizacion.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-stone-900">
                    ${(Number(detalle.precio_snapshot) * detalle.cantidad).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer data */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Datos del Cliente</h2>
            <div className="text-sm text-stone-700 space-y-1">
              <p><span className="font-medium text-stone-900">Nombre:</span> {pedido.usuario?.nombre || `Usuario #${pedido.usuario_id}`}</p>
              <p><span className="font-medium text-stone-900">Email:</span> {pedido.usuario?.nombre ? `${pedido.usuario_id}@email.com` : '—'}</p>
              <p><span className="font-medium text-stone-900">ID Usuario:</span> #{pedido.usuario_id}</p>
              <p><span className="font-medium text-stone-900">Forma de pago:</span> {pedido.forma_pago_codigo}</p>
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Dirección de entrega</h2>
            {addressParts ? (
              <div className="text-sm text-stone-700">
                {pedido.direccion_snapshot_alias && (
                  <p className="font-medium text-stone-900">{pedido.direccion_snapshot_alias}</p>
                )}
                <p>{addressParts}</p>
                <p>{pedido.direccion_snapshot_ciudad}, CP {pedido.direccion_snapshot_cp}</p>
              </div>
            ) : (
              <p className="text-sm text-stone-400">Sin dirección especificada</p>
            )}
          </div>
        </div>

        {/* Right: summary + payment + FSM actions + timeline */}
        <div className="lg:col-span-1 space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Resumen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>${(Number(pedido.total) - 50).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Envío</span>
                <span>$50.00</span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex justify-between">
                <span className="font-semibold text-stone-900">Total</span>
                <span className="text-lg font-bold text-brand-600">${Number(pedido.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment status */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Pago</h2>
            {pagos && pagos.length > 0 ? (
              <div className="text-sm text-stone-700 space-y-1">
                {pagos.map((pago) => (
                  <div key={pago.id}>
                    <p><span className="font-medium text-stone-900">Estado:</span> {pago.mp_status}</p>
                    <p className="text-xs text-stone-500">ID: {pago.mp_payment_id || '—'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-400">Sin pago registrado</p>
            )}
          </div>

          {/* FSM Actions */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Acciones</h2>
            {allActions.length === 0 ? (
              <p className="text-sm text-stone-400">Estado terminal — sin acciones disponibles</p>
            ) : (
              <div className="flex flex-col gap-2">
                {allActions.map((estadoHasta) => (
                  <StateTransitionButton
                    key={estadoHasta}
                    estadoActual={pedido.estado_codigo}
                    estadoHasta={estadoHasta}
                    onClick={() => handleTransitionClick(estadoHasta)}
                    disabled={transitionMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status history timeline */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Historial de estados</h2>
            {(!historial || historial.length === 0) ? (
              <p className="text-sm text-stone-400">Sin historial</p>
            ) : (
              <div className="space-y-4">
                {[...historial].reverse().map((entry) => (
                  <div key={entry.id} className="relative pl-6 border-l-2 border-stone-200">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500" />
                    <div>
                      <p className="text-xs text-stone-500">
                        {new Date(entry.created_at).toLocaleString('es-AR')}
                      </p>
                      <p className="text-sm font-medium text-stone-900">
                        {entry.estado_desde ? STATUS_LABELS[entry.estado_desde] || entry.estado_desde : '—'}
                        {' → '}
                        {STATUS_LABELS[entry.estado_hasta] || entry.estado_hasta}
                      </p>
                      {entry.observacion && (
                        <p className="text-xs text-stone-500 mt-0.5">{entry.observacion}</p>
                      )}
                      <p className="text-xs text-stone-400 mt-0.5">
                        Usuario #{entry.usuario_id || '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transition confirmation modal */}
      <TransitionModal
        open={modalState.open}
        estadoHasta={modalState.estadoHasta}
        onConfirm={handleConfirm}
        onCancel={() => setModalState({ open: false, estadoHasta: '' })}
        isLoading={transitionMutation.isPending}
      />
    </div>
  )
}
