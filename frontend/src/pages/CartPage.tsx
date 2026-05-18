import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@features/cart/store/cartStore'
import { ROUTES } from '@shared/config/routes'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  function formatExclusions(item: (typeof items)[0]): string | null {
    if (!item.personalizacion || item.personalizacion.length === 0) return null
    return `Sin ${item.personalizacion.length} ingrediente${item.personalizacion.length > 1 ? 's' : ''}`
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-stone-500 mb-6">Agregá productos desde nuestro catálogo</p>
        <Link
          to={ROUTES.CATALOG}
          className="inline-block px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
        >
          Ir al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Mi Carrito</h1>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.producto.id}
              className="flex gap-4 p-4 bg-white rounded-lg border border-stone-200"
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 rounded-lg bg-stone-100 flex-shrink-0 flex items-center justify-center text-3xl overflow-hidden">
                {item.producto.imagen ? (
                  <img src={item.producto.imagen} alt={item.producto.nombre} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">{item.producto.nombre}</h3>
                    <p className="text-sm text-stone-500">${Number(item.producto.precio_base).toFixed(2)} c/u</p>
                    {formatExclusions(item) && (
                      <p className="text-xs text-red-500 mt-1">{formatExclusions(item)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.producto.id)}
                    className="text-stone-400 hover:text-red-500 transition-colors p-1"
                    aria-label={`Eliminar ${item.producto.nombre}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Quantity + subtotal */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                      className="w-8 h-8 rounded-lg border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-lg font-semibold text-stone-900 w-8 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                      className="w-8 h-8 rounded-lg border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-lg font-bold text-stone-900">
                    ${(item.producto.precio_base * item.cantidad).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-stone-200 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Resumen del pedido</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Subtotal ({items.reduce((sum, i) => sum + i.cantidad, 0)} items)</span>
                <span>${totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>Costo de envío</span>
                <span className="text-stone-400">A calcular</span>
              </div>
              <div className="border-t border-stone-200 pt-3 flex justify-between">
                <span className="text-base font-semibold text-stone-900">Total</span>
                <span className="text-xl font-bold text-brand-600">${totalPrice().toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full mt-6 py-3 text-sm font-semibold text-center text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Proceder al checkout
            </Link>
          </div>
        </div>
      </div>

      {/* Clear cart confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Vaciar carrito</h3>
            <p className="text-sm text-stone-600 mb-6">
              ¿Estás seguro de eliminar todos los productos del carrito? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  clearCart()
                  setShowClearConfirm(false)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Vaciar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
