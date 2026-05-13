import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { usePedidoDetalle, useHistorialPedido, usePagoByPedido, useIniciarPago } from '@entities/api/pedidosApi'
import { ROUTES } from '@shared/config/routes'

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

const PAGO_STATUS_STYLES: Record<string, string> = {
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROCESS: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
}

const PAGO_STATUS_LABELS: Record<string, string> = {
  APPROVED: 'Pagado',
  REJECTED: 'Rechazado',
  PENDING: 'Pendiente',
  IN_PROCESS: 'En proceso',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
  CHARGEBACK: 'Contracargo',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = Number(id)

  const { data: pedido, isLoading, error } = usePedidoDetalle(orderId)
  const { data: historial } = useHistorialPedido(orderId)
  const { data: pagos } = usePagoByPedido(orderId)
  const iniciarPago = useIniciarPago()

  const [retryLoading, setRetryLoading] = useState(false)
  const [retryError, setRetryError] = useState('')

  // Handle MP callback payment status from URL params
  const paymentStatus = searchParams.get('payment')
  const [callbackMsg, setCallbackMsg] = useState<string | null>(null)

  useEffect(() => {
    if (paymentStatus === 'success') {
      setCallbackMsg('✅ Pago exitoso. Tu pedido está confirmado.')
    } else if (paymentStatus === 'failure') {
      setCallbackMsg('❌ El pago fue rechazado. Podés reintentarlo.')
    } else if (paymentStatus === 'pending') {
      setCallbackMsg('⏳ El pago está en proceso. Te notificaremos cuando se confirme.')
    }
  }, [paymentStatus])

  // Get latest payment
  const latestPago = pagos && pagos.length > 0
    ? pagos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null

  function handleRetryPayment() {
    if (!orderId) return
    setRetryLoading(true)
    setRetryError('')
    iniciarPago.mutate(
      { pedido_id: orderId, forma_pago_codigo: 'MERCADOPAGO' },
      {
        onSuccess: (res) => {
          setRetryLoading(false)
          window.location.href = res.init_point
        },
        onError: (err) => {
          setRetryError(err.message || 'Error al iniciar el pago')
          setRetryLoading(false)
        },
      },
    )
  }

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Cargando pedido...</div>
  }

  if (error) {
    const status = (error as any)?.response?.status
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">
          {status === 403
            ? 'No tenés permiso para ver este pedido'
            : status === 404
              ? 'Pedido no encontrado'
              : 'Error al cargar el pedido'}
        </p>
        <Link to={ROUTES.ORDERS} className="text-orange-600 hover:underline text-sm">
          Volver a mis pedidos
        </Link>
      </div>
    )
  }

  if (!pedido) return null

  const addressParts = [
    pedido.direccion_snapshot_linea1,
    pedido.direccion_snapshot_linea2,
  ].filter(Boolean).join(', ')

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="text-orange-600 hover:underline mb-4 inline-block text-sm"
      >
        ← Volver
      </button>

      {/* Callback message from MP */}
      {callbackMsg && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg">
          {callbackMsg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedido #{pedido.id}</h1>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${STATUS_STYLES[pedido.estado_codigo] || ''}`}>
          {STATUS_LABELS[pedido.estado_codigo] || pedido.estado_codigo}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: items + address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos</h2>
            <div className="space-y-3">
              {pedido.detalles?.map((detalle) => (
                <div key={detalle.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{detalle.nombre_snapshot}</p>
                    <p className="text-xs text-gray-500">
                      ${Number(detalle.precio_snapshot).toFixed(2)} x {detalle.cantidad}
                    </p>
                    {detalle.personalizacion && detalle.personalizacion.length > 0 && (
                      <p className="text-xs text-red-500 mt-0.5">
                        Sin {detalle.personalizacion.length} ingrediente{detalle.personalizacion.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    ${(Number(detalle.precio_snapshot) * detalle.cantidad).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Dirección de entrega</h2>
            {addressParts ? (
              <div className="text-sm text-gray-700">
                {pedido.direccion_snapshot_alias && (
                  <p className="font-medium text-gray-900">{pedido.direccion_snapshot_alias}</p>
                )}
                <p>{addressParts}</p>
                <p>{pedido.direccion_snapshot_ciudad}, CP {pedido.direccion_snapshot_cp}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Sin dirección especificada</p>
            )}
          </div>
        </div>

        {/* Right: summary + payment + timeline */}
        <div className="lg:col-span-1 space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${(Number(pedido.total) - 50).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>$50.00</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-orange-600">${Number(pedido.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pago</h2>
            {latestPago ? (
              <div>
                <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${PAGO_STATUS_STYLES[latestPago.mp_status] || 'bg-gray-100 text-gray-600'}`}>
                  {PAGO_STATUS_LABELS[latestPago.mp_status] || latestPago.mp_status}
                </span>

                {/* Retry button for rejected payments */}
                {pedido.estado_codigo === 'PENDIENTE' && latestPago.mp_status === 'REJECTED' && (
                  <div className="mt-4">
                    <button
                      onClick={handleRetryPayment}
                      disabled={retryLoading}
                      className="w-full py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {retryLoading ? 'Iniciando pago...' : 'Reintentar pago'}
                    </button>
                  </div>
                )}

                {/* Pay button if still pending */}
                {pedido.estado_codigo === 'PENDIENTE' && latestPago.mp_status === 'PENDING' && (
                  <div className="mt-4">
                    <button
                      onClick={handleRetryPayment}
                      disabled={retryLoading}
                      className="w-full py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {retryLoading ? 'Iniciando pago...' : 'Ir a pagar'}
                    </button>
                  </div>
                )}

                {retryError && (
                  <p className="text-xs text-red-500 mt-2">{retryError}</p>
                )}
              </div>
            ) : pedido.estado_codigo === 'PENDIENTE' ? (
              <div>
                <p className="text-sm text-gray-500 mb-3">Sin pago iniciado</p>
                <button
                  onClick={handleRetryPayment}
                  disabled={retryLoading}
                  className="w-full py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {retryLoading ? 'Iniciando pago...' : 'Pagar ahora'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>

          {/* Status history timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de estados</h2>
            {(!historial || historial.length === 0) ? (
              <p className="text-sm text-gray-400">Sin historial</p>
            ) : (
              <div className="space-y-4">
                {[...historial].reverse().map((entry) => (
                  <div key={entry.id} className="relative pl-6 border-l-2 border-gray-200">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.created_at).toLocaleString('es-AR')}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {entry.estado_desde ? STATUS_LABELS[entry.estado_desde] || entry.estado_desde : '—'}
                        {' → '}
                        {STATUS_LABELS[entry.estado_hasta] || entry.estado_hasta}
                      </p>
                      {entry.observacion && (
                        <p className="text-xs text-gray-500 mt-0.5">{entry.observacion}</p>
                      )}
                      {entry.motivo && (
                        <p className="text-xs text-red-500 mt-0.5">Motivo: {entry.motivo}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
