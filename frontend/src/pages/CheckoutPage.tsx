import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@features/cart/store/cartStore'
import { useDirecciones } from '@entities/api/direccionesApi'
import { useCreatePedido, useIniciarPago } from '@entities/api/pedidosApi'
import { ROUTES, orderDetailPath } from '@shared/config/routes'
import { COSTO_ENVIO_PREVIEW } from '@shared/config/pricing'

const FORMAS_PAGO = [
  { codigo: 'MERCADOPAGO', label: 'Mercado Pago' },
  { codigo: 'EFECTIVO', label: 'Efectivo (al recibir)' },
  { codigo: 'RAPIPAGO', label: 'Rapipago' },
  { codigo: 'PAGOFACIL', label: 'Pago Fácil' },
] as const

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalPrice } = useCartStore()
  const { data: direcciones, isLoading: loadingDir } = useDirecciones()
  const createPedido = useCreatePedido()
  const iniciarPago = useIniciarPago()

  const [selectedDireccionId, setSelectedDireccionId] = useState<number | null>(null)
  const [formaPago, setFormaPago] = useState<string>('MERCADOPAGO')
  const [error, setError] = useState('')
  const [createdPedidoId, setCreatedPedidoId] = useState<number | null>(null)
  const [pagoInitPoint, setPagoInitPoint] = useState<string | null>(null)
  const [pagoLoading, setPagoLoading] = useState(false)

  // Pre-seleccionar dirección principal cuando llegan los datos.
  useEffect(() => {
    if (selectedDireccionId !== null) return
    const defaultDir = direcciones?.find((d) => d.es_principal)
    if (defaultDir) setSelectedDireccionId(defaultDir.id)
  }, [direcciones, selectedDireccionId])

  // Empty cart — redirect to catalog
  if (items.length === 0 && !createdPedidoId) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-stone-500 mb-6">Agregá productos antes de hacer el checkout</p>
        <Link
          to={ROUTES.CATALOG}
          className="inline-block px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700"
        >
          Ir al catálogo
        </Link>
      </div>
    )
  }

  // Success state — show payment option
  if (createdPedidoId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <span className="text-6xl block mb-4">🎉</span>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Pedido creado con éxito</h1>
        <p className="text-stone-500 mb-2">Número de pedido: <strong className="text-stone-900">#{createdPedidoId}</strong></p>
        <p className="text-sm text-stone-500 mb-8">Estado: <span className="font-medium text-yellow-600">PENDIENTE — Esperando pago</span></p>

        {pagoInitPoint ? (
          <a
            href={pagoInitPoint}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Pagar con MercadoPago
          </a>
        ) : !pagoLoading ? (
          <button
            onClick={handlePagar}
            className="px-8 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir a pagar
          </button>
        ) : (
          <div className="text-sm text-stone-400">Iniciando pago...</div>
        )}

        {error && (
          <p className="text-sm text-red-500 mt-4">{error}</p>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <Link
            to={orderDetailPath(createdPedidoId)}
            className="px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700"
          >
            Ver detalle del pedido
          </Link>
          <Link
            to={ROUTES.CATALOG}
            className="px-6 py-3 text-sm font-semibold text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    )
  }

  function handleCreateOrder() {
    setError('')

    if (!selectedDireccionId) {
      setError('Seleccioná una dirección de entrega')
      return
    }

    const payload = {
      forma_pago_codigo: formaPago,
      direccion_id: selectedDireccionId,
      items: items.map((i) => ({
        producto_id: i.producto.id,
        cantidad: i.cantidad,
        personalizacion: i.personalizacion,
      })),
    }

    createPedido.mutate(payload, {
      onSuccess: (pedido) => {
        setCreatedPedidoId(pedido.id)
        // Solo iniciamos el flujo de MP cuando la forma de pago es MercadoPago.
        if (formaPago !== 'MERCADOPAGO') {
          navigate(orderDetailPath(pedido.id))
          return
        }
        setPagoLoading(true)
        iniciarPago.mutate(
          { pedido_id: pedido.id, forma_pago_codigo: formaPago },
          {
            onSuccess: (res) => {
              setPagoInitPoint(res.init_point)
              setPagoLoading(false)
              window.open(res.init_point, '_blank')
              navigate(orderDetailPath(pedido.id))
            },
            onError: (_err) => {
              setError('Pedido creado, pero no se pudo iniciar el pago. Podés pagar desde Mis Pedidos.')
              setPagoLoading(false)
            },
          },
        )
      },
      onError: (err) => {
        setError(err.message || 'Error al crear el pedido. Revisá el stock y los precios.')
      },
    })
  }

  function handlePagar() {
    if (!createdPedidoId) return
    setPagoLoading(true)
    setError('')
    iniciarPago.mutate(
      { pedido_id: createdPedidoId, forma_pago_codigo: 'MERCADOPAGO' },
      {
        onSuccess: (res) => {
          setPagoInitPoint(res.init_point)
          setPagoLoading(false)
          window.open(res.init_point, '_blank')
          navigate(orderDetailPath(createdPedidoId))
        },
        onError: (err) => {
          setError(err.message || 'Error al iniciar el pago')
          setPagoLoading(false)
        },
      },
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: order summary + address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart summary (read-only) */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Resumen del carrito</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.producto.id} className="flex justify-between text-sm">
                  <span className="text-stone-700">
                    {item.producto.nombre} <span className="text-stone-400">x{item.cantidad}</span>
                  </span>
                  <span className="text-stone-900 font-medium">
                    ${(item.producto.precio_base * item.cantidad).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method selection */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Forma de pago</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FORMAS_PAGO.map((fp) => (
                <label
                  key={fp.codigo}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formaPago === fp.codigo
                      ? 'border-brand-300 bg-brand-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="forma_pago"
                    checked={formaPago === fp.codigo}
                    onChange={() => setFormaPago(fp.codigo)}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-stone-700">{fp.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Address selection */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Dirección de entrega</h2>
            {loadingDir ? (
              <p className="text-sm text-stone-400">Cargando direcciones...</p>
            ) : !direcciones || direcciones.length === 0 ? (
              <div className="text-sm text-stone-500">
                <p className="mb-2">No tenés direcciones guardadas.</p>
                <Link to={ROUTES.ADDRESSES} className="text-brand-600 hover:underline">
                  Agregá una dirección
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {direcciones.map((dir) => {
                  const fullAddress = [dir.linea1, dir.linea2].filter(Boolean).join(', ')
                  return (
                    <label
                      key={dir.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDireccionId === dir.id
                          ? 'border-brand-300 bg-brand-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="direccion"
                        checked={selectedDireccionId === dir.id}
                        onChange={() => setSelectedDireccionId(dir.id)}
                        className="mt-0.5 text-brand-600 focus:ring-brand-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {dir.alias || 'Dirección'}
                          {dir.es_principal && (
                            <span className="ml-2 text-xs text-brand-600 font-medium">(Principal)</span>
                          )}
                        </p>
                        <p className="text-sm text-stone-600">{fullAddress}</p>
                        <p className="text-sm text-stone-500">{dir.ciudad}, CP {dir.cp}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: order summary + confirm */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-stone-200 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Confirmar pedido</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Items ({items.length})</span>
                <span>${totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>Envío</span>
                <span>${COSTO_ENVIO_PREVIEW.toFixed(2)}</span>
              </div>
              <div className="border-t border-stone-200 pt-3 flex justify-between">
                <span className="text-base font-semibold text-stone-900">Total</span>
                <span className="text-xl font-bold text-brand-600">
                  ${(totalPrice() + COSTO_ENVIO_PREVIEW).toFixed(2)}
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateOrder}
              disabled={createPedido.isPending || !selectedDireccionId}
              className="w-full py-3 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {createPedido.isPending ? 'Creando pedido...' : 'Confirmar pedido'}
            </button>

            <p className="text-xs text-stone-400 text-center mt-2">
              Al confirmar aceptás los términos y condiciones
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
